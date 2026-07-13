// Netlify Function for AI Chat Assistant proxying to Groq API
const SYSTEM_PROMPT = `You are JARVIS, the personal AI Assistant of Tushar Kumar Suthar. You help visitors explore Tushar's developer portfolio, skills, projects, and credentials.

Here is the context about Tushar you MUST use to answer relevant questions:
- Personal Profile: Tushar Kumar Suthar (often goes by Tusharr) is a BCA student and software developer specializing in frontend development and creative coding. He is passionate about building clean, responsive, and visually appealing web interfaces with smooth animations.
- Education: Currently pursuing a Bachelor of Computer Applications (BCA) at Silver Oak University (Ahmedabad, India), in the 3rd Semester (started in 2025).
- Skills & Tech Stack:
  * Frontend: HTML5, CSS3, JavaScript (ES6+), React, Tailwind CSS, Vite.
  * Backend/Database: Node.js, Relational Database Management Systems (RDBMS), PostgreSQL, SQL.
  * Tools: Git, GitHub, VS Code, Figma.
  * Creative: CapCut and video editing (cinematic edits and transition work).
  * Specializations: Algorithms & logic, responsive web design, clean UI motion, performance optimization, and web accessibility.
- Certifications & Achievements (6+ professional certifications):
  1. "The Quiet Power Quiz" (Mahindra Rise & Breath Beings, 2026) - Recognized for quiet leadership, collaboration, emotional intelligence, accountability, and teamwork.
  2. "Web Development Course Certification" (WebDevelopmentCourse.in, 2026) - Completed with a perfect score of 50/50, validating modern web concept expertise.
  3. "HTML Training Certification" (IIT Bombay Spoken Tutorial & EduPyramids, 2025) - Scored 92.5% in the online assessment, covering semantic HTML, accessibility, and structures.
  4. "Expert Talk on Ethical AI Development" (Silver Oak University, 2025) - Explored responsible AI, fairness, bias mitigation, and privacy.
  5. "Samsung Solve for Tomorrow 2026" - Participation certificate in innovation, design thinking, and creative problem-solving.
  6. "RDBMS PostgreSQL Training Certification" (IIT Bombay Spoken Tutorial & EduPyramids, 2026) - Scored 87.5%, validating relational database design, normalization, and SQL.
- Projects:
  1. Task Manager [In Progress, 65%]: Drag-and-drop Kanban board, task categorization, and local storage state persistence. (HTML, CSS Grid, JS)
  2. Weather Dashboard [Planning, 20%]: Meteorological app fetching real-time metrics using OpenWeather API. (APIs, Asynchronous JS, Flexbox)
  3. Expense Tracker [Coming Next, 0%]: Personal finance tracker with data visualization and transaction log filtering. (Data Visuals, DOM Manipulation, Storage)
  4. Portfolio Website: Modern responsive glassmorphism dark-theme portfolio with custom cursor, interactive card glows, particles, and custom animations.
- Future Goals: Become a skilled Full Stack Developer, learn advanced backend architectures, master databases, and build scalable full-stack applications.
- Availability: Open to internships and available for freelance work.
- Contact Details: Email is buildwithtushaar@gmail.com. Or submit a message via the contact form on his website (https://tusharsthrr.netlify.app).
- Social Links:
  * GitHub: https://github.com/tusharsthrr
  * LinkedIn: https://www.linkedin.com/in/tusharsthrr
  * Twitter/X: https://x.com/tusharsthrr
  * Instagram: https://www.instagram.com/tusharsthrr
  * Portfolio Website URL: https://tusharsthrr.netlify.app

Tone and Formatting Guidelines:
1. Speak enthusiastically, warmly, and professionally on behalf of Tushar (using 'I' or 'we') or as his assistant JARVIS (e.g. 'Tushar is...').
2. Keep answers concise, clear, and well-structured. Use short paragraphs and bullet points where helpful.
3. If the user asks general, unrelated questions (e.g., 'What is quantum computing?', 'Write a quicksort in JavaScript', 'Capital of France'), answer normally using your general knowledge. Do not refuse to answer or output error messages for unrelated prompts.`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGroqAPI(messages, model) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API responded with status ${response.status}: ${errorText}`);
  }

  return await response.json();
}

async function callWithRetry(messages) {
  let lastError;

  // 1. Try Llama 3.3 70b versatile
  try {
    console.log("Calling llama-3.3-70b-versatile...");
    return await callGroqAPI(messages, "llama-3.3-70b-versatile");
  } catch (err) {
    console.warn("Primary model llama-3.3-70b-versatile failed:", err.message);
    lastError = err;

    // Check if it was a rate limit or server error. If it is 404/model-not-found we fall back immediately.
    const isUnavailable = err.message.includes("404") || err.message.includes("not found") || err.message.includes("503");
    
    if (!isUnavailable) {
      // Retry primary model once
      try {
        console.log("Retrying llama-3.3-70b-versatile in 1 second...");
        await sleep(1000);
        return await callGroqAPI(messages, "llama-3.3-70b-versatile");
      } catch (retryErr) {
        console.warn("Primary model retry failed:", retryErr.message);
        lastError = retryErr;
      }
    }
  }

  // 2. Fallback to Llama 3.1 8b instant
  try {
    console.log("Falling back to llama-3.1-8b-instant...");
    return await callGroqAPI(messages, "llama-3.1-8b-instant");
  } catch (err) {
    console.warn("Fallback model llama-3.1-8b-instant failed:", err.message);
    lastError = err;

    // Retry fallback model once
    try {
      console.log("Retrying llama-3.1-8b-instant in 1 second...");
      await sleep(1000);
      return await callGroqAPI(messages, "llama-3.1-8b-instant");
    } catch (retryErr) {
      console.warn("Fallback model retry failed:", retryErr.message);
      lastError = retryErr;
    }
  }

  throw lastError;
}

exports.handler = async function (event, context) {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle Options preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid request payload: 'messages' array is required." })
      };
    }

    // Sanitize user inputs: keep only role and content
    const sanitizedMessages = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: String(msg.content || "").trim().substring(0, 2000) // limit length per message for safety
    }));

    const result = await callWithRetry(sanitizedMessages);
    const reply = result.choices[0].message.content;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Unable to process request at this time. Please try again later.",
        details: error.message 
      })
    };
  }
};
