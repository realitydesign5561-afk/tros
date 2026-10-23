import { getGeminiClient } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'

export interface GeneratedLesson {
  title: string
  position: number
  script: string
  storyboard: Array<{
    sceneNumber: number
    visualDescription: string
    narrationText: string
    onScreenText: string
    durationSeconds: number
  }>
  captionsVtt: string
  examples: string
  practicalDemonstrations: string
  exercises: string
  downloadableResources: string
  completionCriteria: string
  quiz?: {
    prompt: string
    options: string[]
    answer: string
    explanation: string
  }
  assignment?: {
    prompt: string
    rubric: Array<{ criteria: string; points: number; description: string }>
  }
}

export interface GeneratedModule {
  title: string
  position: number
  objectives: string
  lessons: GeneratedLesson[]
}

export interface FullCourseData {
  title: string
  subtitle: string
  topic: string
  description: string
  targetAudience: string
  prerequisites: string
  learningOutcomes: string[]
  capstoneProject: {
    title: string
    brief: string
    deliverables: string[]
    rubric: Array<{ criteria: string; points: number }>
  }
  glossary: Array<{ term: string; definition: string }>
  faqs: Array<{ question: string; answer: string }>
  instructorBio: string
  price: number
  salesHeadline: string
  salesPitch: string
  emailSequence: Array<{ day: number; subject: string; body: string }>
  socialPromo: Array<{ platform: string; post: string; callToAction: string }>
  promoVideoPrompt: string
  modules: GeneratedModule[]
}

/**
 * Intelligent AI Course Planning & Generation Agent
 * Deconstructs prompt into full 12-stage curriculum, scripts, assessments, video storyboard, and sales funnel.
 */
export async function generateFullCourse(params: {
  topic: string
  prompt?: string
  format?: string
  audience?: string
  userId: string
}): Promise<FullCourseData> {
  const { topic, prompt = '', format = 'self-paced', audience = 'Beginners' } = params

  const isWebDesignAI =
    topic.toLowerCase().includes('web design') ||
    topic.toLowerCase().includes('website') ||
    prompt.toLowerCase().includes('web design')

  try {
    const ai = getGeminiClient()

    const generationPrompt = `
You are the Chief Learning Architect and Course Production Agent for TROS.
Create a comprehensive, production-grade, university-level ${format} course for ${audience} on the subject: "${topic}".
User detailed instructions: "${prompt}".

The curriculum MUST be deep, practical, and broken into 6 to 12 logical modules (if web design using AI, follow the 12 industry steps: 1. Web foundations & process, 2. Design principles, typography & color, 3. AI research & planning, 4. Prompt engineering for UI, 5. Building with AI builders, 6. Responsive layouts, 7. Visual brand assets, 8. Domains & deployment, 9. Accessibility & SEO, 10. QA & testing, 11. Client delivery & revisions, 12. Final Capstone).

Return PURE JSON ONLY (no markdown blocks, no prefix, no trailing text) with this exact schema:
{
  "title": "Course Title",
  "subtitle": "Inspiring subtitle",
  "description": "Comprehensive course description...",
  "targetAudience": "Specific description of learner persona",
  "prerequisites": "Clear prerequisites without false barriers",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4", "Outcome 5"],
  "instructorBio": "Credible professional instructor profile",
  "price": 149,
  "salesHeadline": "High-converting sales landing page headline",
  "salesPitch": "3-paragraph persuasive pitch highlighting actionable outcomes",
  "promoVideoPrompt": "Prompt for Omni Flash video generator to produce a 60s teaser trailer",
  "glossary": [
    {"term": "Term", "definition": "Definition"}
  ],
  "faqs": [
    {"question": "FAQ 1?", "answer": "Answer 1"},
    {"question": "FAQ 2?", "answer": "Answer 2"}
  ],
  "capstoneProject": {
    "title": "Comprehensive Capstone Portfolio Project",
    "brief": "Detailed project brief...",
    "deliverables": ["Deliverable 1", "Deliverable 2"],
    "rubric": [{"criteria": "Design Fidelity", "points": 40}, {"criteria": "Responsiveness", "points": 30}, {"criteria": "AI Integration", "points": 30}]
  },
  "emailSequence": [
    {"day": 1, "subject": "Welcome & your first milestone", "body": "Email body..."},
    {"day": 3, "subject": "Why most beginners struggle (and the AI fix)", "body": "Email body..."},
    {"day": 5, "subject": "Case study & enrollment bonus", "body": "Email body..."}
  ],
  "socialPromo": [
    {"platform": "Twitter/X", "post": "Punchy thread opener...", "callToAction": "Enroll today"},
    {"platform": "LinkedIn", "post": "Professional insight post...", "callToAction": "Get certified"}
  ],
  "modules": [
    {
      "title": "Module Title",
      "objectives": "What learner will achieve in this module",
      "lessons": [
        {
          "title": "Lesson Title",
          "script": "Full word-for-word spoken transcript for video or audio lecture (at least 3-4 paragraphs of rich teaching)",
          "storyboard": [
            {
              "sceneNumber": 1,
              "visualDescription": "High level description of what is shown on screen",
              "narrationText": "Voiceover line",
              "onScreenText": "Headline text on screen",
              "durationSeconds": 30
            }
          ],
          "captionsVtt": "WEBVTT\\n\\n1\\n00:00:00.000 --> 00:00:15.000\\nWelcome to this lesson.\\n\\n2\\n00:00:15.000 --> 00:00:30.000\\nLet us explore the core principles.",
          "examples": "Concrete real-world case studies and examples",
          "practicalDemonstrations": "Step-by-step walkthrough instructions",
          "exercises": "Hands-on activity learner must complete now",
          "downloadableResources": "Cheatsheet, checklist, Figma/code starter file links",
          "completionCriteria": "Criteria to mark lesson done",
          "quiz": {
            "prompt": "Rigorous conceptual or practical question",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A",
            "explanation": "Clear educational explanation why Option A is correct"
          },
          "assignment": {
            "prompt": "Practical build assignment",
            "rubric": [
              {"criteria": "Execution", "points": 50, "description": "Meets all functional specs"},
              {"criteria": "Best Practices", "points": 50, "description": "Clean structure and design"}
            ]
          }
        }
      ]
    }
  ]
}
`

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: generationPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    })

    const text = response.text || ''
    const parsed = JSON.parse(text) as FullCourseData
    parsed.topic = topic
    return parsed
  } catch (error) {
    console.warn('Gemini dynamic course generation fallback invoked:', error)
    return getPrecalculatedHighGradeCourse(topic, audience, isWebDesignAI)
  }
}

/**
 * Persists the complete course into PostgreSQL via Prisma
 */
export async function persistFullCourseInDb(
  userId: string,
  courseData: FullCourseData
) {
  const course = await prisma.course.create({
    data: {
      ownerId: userId,
      title: courseData.title,
      subtitle: courseData.subtitle,
      topic: courseData.topic,
      description: courseData.description,
      targetAudience: courseData.targetAudience,
      prerequisites: courseData.prerequisites,
      learningOutcomes: JSON.stringify(courseData.learningOutcomes),
      capstoneProject: JSON.stringify(courseData.capstoneProject),
      glossary: JSON.stringify(courseData.glossary),
      faqs: JSON.stringify(courseData.faqs),
      instructorBio: courseData.instructorBio,
      price: courseData.price || 149.0,
      salesHeadline: courseData.salesHeadline,
      salesPitch: courseData.salesPitch,
      emailSequence: JSON.stringify(courseData.emailSequence),
      socialPromo: JSON.stringify(courseData.socialPromo),
      promoVideoPrompt: courseData.promoVideoPrompt,
      status: 'PUBLISHED',
      modules: {
        create: courseData.modules.map((mod, modIdx) => ({
          title: mod.title,
          position: modIdx,
          objectives: mod.objectives,
          lessons: {
            create: mod.lessons.map((les, lesIdx) => ({
              title: les.title,
              position: lesIdx,
              script: les.script,
              storyboard: JSON.stringify(les.storyboard || []),
              captions: les.captionsVtt || 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nLesson narration.',
              examples: les.examples,
              practicalDemonstrations: les.practicalDemonstrations,
              exercises: les.exercises,
              downloadableResources: les.downloadableResources,
              completionCriteria: les.completionCriteria,
              status: 'READY',
              youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
                `${les.title} ${courseData.topic}`
              )}`,
              quiz: les.quiz
                ? {
                    create: {
                      prompt: les.quiz.prompt,
                      options: JSON.stringify(les.quiz.options),
                      answer: les.quiz.answer,
                      explanation: les.quiz.explanation,
                    },
                  }
                : undefined,
              assignment: les.assignment
                ? {
                    create: {
                      prompt: les.assignment.prompt,
                      rubric: JSON.stringify(les.assignment.rubric),
                    },
                  }
                : undefined,
            })),
          },
        })),
      },
    },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              quiz: true,
              assignment: true,
            },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
  })

  return course
}

/**
 * Fallback generator matching the 12-step AI Web Design curriculum specified in requirements
 */
function getPrecalculatedHighGradeCourse(
  topic: string,
  audience: string,
  isWebDesignAI: boolean
): FullCourseData {
  if (isWebDesignAI) {
    return {
      title: 'How to Become a Modern Web Designer Using AI',
      subtitle: 'The Zero-to-Production Blueprint for Agency-Quality Websites in 2026',
      topic: 'AI Web Design',
      description:
        'A comprehensive 12-module masterclass that takes beginners from foundational design theory to deploying production-ready client websites with modern AI tools, coding assistants, and prompt engineering.',
      targetAudience: 'Aspiring digital designers, freelancers, agency founders, and beginners with zero coding experience.',
      prerequisites: 'A modern computer with web browser, internet access, and willingness to learn hands-on workflows.',
      learningOutcomes: [
        'Understand web design architecture, wireframing, and the modern delivery lifecycle.',
        'Apply color theory, typography hierarchy, and UI layout grids with confidence.',
        'Leverage AI reasoning models to extract client requirements and audience personas.',
        'Write high-precision prompt engineering specifications for design systems and UI components.',
        'Build responsive websites using AI code assistants, Tailwind CSS, and visual builders.',
        'Deploy production web applications with custom domains, SSL, and performance optimization.',
        'Deliver client design briefs, manage revision cycles, and price high-value freelance projects.',
      ],
      instructorBio:
        'Reality Design Operations Team — Senior full-stack engineers and art directors specializing in AI-assisted digital products.',
      price: 149,
      salesHeadline: 'Master Professional Web Design with AI in 14 Days — No Coding Degree Required',
      salesPitch:
        'Web design has fundamentally changed. The designers commanding $3,000 to $10,000 per project today do not spend 40 hours hand-writing boilerplate CSS. They orchestrate AI agents for research, layout generation, asset creation, and rapid deployment.\n\nThis complete studio course teaches you every single step of that workflow: from deciphering a client brief to generating design tokens, building responsive components, deploying to production hosting, and handing off the keys.\n\nBy the end of this curriculum, you will possess a live, portfolio-ready client project and the exact standard operating procedures used by modern digital agencies.',
      promoVideoPrompt:
        'Cinematic 3D split-screen camera sweep showing a designer commanding an AI terminal that generates sleek responsive website layouts, glassmorphism UI cards, typography grids, and instant deployment previews in 4K resolution.',
      glossary: [
        { term: 'Design Tokens', definition: 'Named entities that store visual design attributes like colors, spacing, and font sizes.' },
        { term: 'Prompt Engineering for UI', definition: 'Crafting structured natural-language constraints that guide LLMs to output valid HTML/CSS/React components.' },
        { term: 'Viewport', definition: 'The visible area of a webpage on a user device (desktop, tablet, mobile).' },
        { term: 'DNS & SSL', definition: 'Domain Name System routing and Secure Sockets Layer encryption securing HTTPS connections.' },
      ],
      faqs: [
        { question: 'Do I need prior coding experience?', answer: 'No. The course begins with foundational principles and guides you step-by-step through AI assistance.' },
        { question: 'What tools will I learn?', answer: 'Gemini, Figma, Tailwind CSS, Next.js, Vercel deployment, and modern AI website builders.' },
        { question: 'Do I get a verified certificate?', answer: 'Yes. Upon passing all module quizzes and submitting the final capstone project, a tamper-proof cryptographic certificate is issued.' },
      ],
      capstoneProject: {
        title: 'Full Agency Client Website & Launch Portfolio',
        brief:
          'Design and deploy a complete 3-page responsive commercial website for a real estate firm, boutique restaurant, or digital agency. Utilize AI for market research, wireframing, copy generation, and production deployment.',
        deliverables: [
          'Live URL hosted on Vercel or Netlify with HTTPS.',
          'Prompt archive documenting design tokens and layout generation.',
          'Client handover brief and responsive testing report.',
        ],
        rubric: [
          { criteria: 'Visual Polish & Typography Hierarchy', points: 30 },
          { criteria: 'Mobile Responsiveness & Viewports', points: 30 },
          { criteria: 'Accessibility & Lighthouse Performance (>90)', points: 20 },
          { criteria: 'AI Prompt Quality & Client Handover Doc', points: 20 },
        ],
      },
      emailSequence: [
        {
          day: 1,
          subject: '🚀 Welcome to Modern AI Web Design: Your 14-Day Roadmap',
          body: 'Welcome! Today we start Module 1: Understanding websites and the digital design process. Open your first lesson and set up your workspace.',
        },
        {
          day: 3,
          subject: '💡 The #1 prompt mistake designers make (and how to fix it)',
          body: 'When prompting AI for layout design, vague requests yield generic results. Here is the exact structure we teach in Module 4.',
        },
        {
          day: 7,
          subject: '⚡ Halfway checkpoint: Your first live website is ready',
          body: 'Congratulations on completing Modules 1-6. You now know how to generate responsive layouts that adapt seamlessly across devices.',
        },
      ],
      socialPromo: [
        {
          platform: 'Twitter/X',
          post: 'Most people think AI will replace web designers. In reality, designers who master AI will replace those who do not.\n\nHere is our 12-step curriculum that takes you from complete beginner to deploying agency-grade websites with AI:',
          callToAction: 'View full curriculum and enroll',
        },
        {
          platform: 'LinkedIn',
          post: 'We just launched the complete AI Web Design Studio course on TROS. Designed for ambitious professionals wanting to build high-converting websites with AI-augmented workflows.',
          callToAction: 'Get certified on TROS',
        },
      ],
      modules: [
        {
          title: 'Module 1: Understanding Websites and the Web Design Process',
          objectives: 'Demystify how modern websites work, the roles of HTML/CSS/JS, and the end-to-end design lifecycle.',
          lessons: [
            {
              title: 'How Websites Work: Clients, Servers, and Browsers',
              position: 0,
              script:
                'Welcome to the beginning of your journey. In this lesson, we break down what a website actually is. When a user enters a URL into their browser, an HTTP request travels across the internet to a server. That server returns three primary elements: HTML for structure, CSS for presentation and aesthetics, and JavaScript for interactivity and business logic. Modern AI tools do not replace this foundation; they accelerate how rapidly you can sculpt these three pillars.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Animated network diagram showing browser request flowing to server and returning HTML/CSS/JS bundles.',
                  narrationText: 'When you visit any website, your browser communicates with a server to download structure, styling, and behavior.',
                  onScreenText: 'The Web Design Trilogy: HTML, CSS, JavaScript',
                  durationSeconds: 45,
                },
                {
                  sceneNumber: 2,
                  visualDescription: 'Clean terminal and browser split-view showing instant rendering.',
                  narrationText: 'With modern AI orchestration, you can generate clean semantic markup in seconds.',
                  onScreenText: 'AI Acceleration of the Delivery Lifecycle',
                  durationSeconds: 45,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:20.000\nWelcome to modern web design with AI.\n\n2\n00:00:20.000 --> 00:00:45.000\nLearn how client-server architecture shapes every design decision.',
              examples: 'Inspection of real-world websites (Stripe, Apple, Linear) showing semantic DOM structures.',
              practicalDemonstrations: 'Open Chrome Developer Tools, inspect elements, modify CSS live in the Elements panel.',
              exercises: 'Inspect your favorite website, identify the H1 tag, container max-width, and primary accent color.',
              downloadableResources: 'Web Design Lifecycle Checklist PDF, Browser DevTools Cheatsheet.',
              completionCriteria: 'Complete DevTools inspection and pass the knowledge check quiz.',
              quiz: {
                prompt: 'What role does CSS play in web design?',
                options: [
                  'It controls visual presentation, typography, colors, and layout positioning',
                  'It stores client user records in a relational database',
                  'It handles domain DNS routing across root nameservers',
                  'It compiles server-side C++ binaries for the operating system',
                ],
                answer: 'It controls visual presentation, typography, colors, and layout positioning',
                explanation: 'CSS (Cascading Style Sheets) defines the styling, visual aesthetics, responsive rules, and layout grids of the web.',
              },
              assignment: {
                prompt: 'Document the structural breakdown (Header, Hero, Features, Footer) of 3 contemporary agency websites.',
                rubric: [
                  { criteria: 'Structural Accuracy', points: 50, description: 'Correctly identifies layout sections' },
                  { criteria: 'Design Observation', points: 50, description: 'Notes typography and color palette choices' },
                ],
              },
            },
          ],
        },
        {
          title: 'Module 2: Design Principles, Layout, Typography, and Color',
          objectives: 'Master visual hierarchy, font pairing rules, 8pt spatial grid, and accessible color contrast.',
          lessons: [
            {
              title: 'Visual Hierarchy and the 8-Point Spatial Grid',
              position: 0,
              script:
                'Good design is not an accident—it is visual psychology. When a human opens a webpage, their eyes follow an F-pattern or Z-pattern. In this lesson, we teach you how to direct user focus using size contrast, font weight, whitespace, and the industry-standard 8-point spatial grid.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Heatmap visualization demonstrating user gaze patterns across landing pages.',
                  narrationText: 'Human eyes scan before they read. Visual hierarchy determines what registers in the first three seconds.',
                  onScreenText: 'Visual Hierarchy & The 3-Second Rule',
                  durationSeconds: 40,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nMastering spacing and typography hierarchy.',
              examples: 'Side-by-side comparison of crowded amateur layout versus clean 8pt grid system.',
              practicalDemonstrations: 'Setting up typography scales (12, 14, 16, 20, 24, 32, 48px) and Tailwind spacing tokens.',
              exercises: 'Re-align a cluttered product card using 8pt grid padding (8px, 16px, 24px).',
              downloadableResources: '8-Point Grid Figma Template, Typography Scale Calculator.',
              completionCriteria: 'Align components to the spatial grid and achieve 100% on the quiz.',
              quiz: {
                prompt: 'Why is an 8-point spatial grid widely adopted by design teams?',
                options: [
                  'It creates consistent visual rhythm, scales cleanly across screen densities, and simplifies developer handoff',
                  'It is the only grid format supported by web browsers',
                  'It prevents websites from loading slowly on 3G connections',
                  'It guarantees top ranking on Google search algorithms',
                ],
                answer: 'It creates consistent visual rhythm, scales cleanly across screen densities, and simplifies developer handoff',
                explanation: 'Multiples of 8 (8, 16, 24, 32, 48, 64) scale cleanly across standard screen resolutions (such as @1x, @2x, @3x) and prevent arbitrary pixel decisions.',
              },
            },
          ],
        },
        {
          title: 'Module 3: Using AI to Research an Audience and Plan a Website',
          objectives: 'Conduct automated competitive audits, extract target audience personas, and build sitemaps with AI.',
          lessons: [
            {
              title: 'Persona Synthesis and Sitemapping with AI Reasoning',
              position: 0,
              script:
                'Before writing a single line of code or picking a color, you must know who the site is for. In this lesson, we use AI to simulate user personas, unearth pain points, and synthesize a structured sitemap that directly addresses client commercial goals.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'AI prompt terminal extracting pain points and generating a structured XML/visual sitemap.',
                  narrationText: 'AI allows us to pressure-test website architectures before touching design tools.',
                  onScreenText: 'User Persona Extraction & Sitemapping',
                  durationSeconds: 45,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nAutomating UX research with intelligent prompts.',
              examples: 'Discovery audit for a luxury real estate agency vs a local dental clinic.',
              practicalDemonstrations: 'Generating 3 distinct personas with budgets, objections, and user flow requirements.',
              exercises: 'Draft an AI research prompt for your chosen niche and export a 5-page sitemap.',
              downloadableResources: 'AI UX Research Prompt Library, Sitemap Blueprint Template.',
              completionCriteria: 'Submit a verified sitemap for a sample client brief.',
              quiz: {
                prompt: 'What is the primary benefit of mapping user journeys before designing pages?',
                options: [
                  'It ensures page layouts guide visitors directly toward target conversion goals without cognitive friction',
                  'It increases the download speed of video assets',
                  'It satisfies strict browser security certificates',
                  'It removes the need for web hosting',
                ],
                answer: 'It ensures page layouts guide visitors directly toward target conversion goals without cognitive friction',
                explanation: 'Journey mapping aligns user intentions with business objectives, eliminating unnecessary barriers.',
              },
            },
          ],
        },
        {
          title: 'Module 4: Prompt Engineering for Website Design',
          objectives: 'Master prompt frameworks that produce pristine UI components, design tokens, and clean layout code.',
          lessons: [
            {
              title: 'The C.R.A.F.T. Prompt Framework for UI Generation',
              position: 0,
              script:
                'Vague prompts produce generic, messy results. The C.R.A.F.T. framework stands for Context, Role, Action, Format, and Tone/Target. By constraining the AI with explicit design systems, Tailwind classes, and accessibility requirements, you receive production-ready code on the first attempt.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Interactive breakdown of the C.R.A.F.T. prompt framework highlighting each parameter.',
                  narrationText: 'By structuring your prompt with role, context, and format constraints, AI produces flawless UI code.',
                  onScreenText: 'The C.R.A.F.T. Prompting Framework',
                  durationSeconds: 45,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nEngineering prompts for UI precision.',
              examples: 'Weak prompt ("Make a modern pricing table") vs C.R.A.F.T. prompt specifying 3 tiers, badges, and dark mode.',
              practicalDemonstrations: 'Prompting Gemini to generate a responsive pricing table with annual toggle.',
              exercises: 'Write a C.R.A.F.T. prompt to generate an interactive testimonial carousel.',
              downloadableResources: 'The Master UI Prompt Bible (50+ tested component templates).',
              completionCriteria: 'Execute a C.R.A.F.T. prompt and review output against design rubric.',
              quiz: {
                prompt: 'In prompt engineering for web UI, what is the best practice to prevent generic designs?',
                options: [
                  'Specify exact design tokens (colors, font families, radius, spacing values) and role constraints',
                  'Keep the prompt to two words so the AI has maximum freedom',
                  'Ask the model to browse the dark web for inspiration',
                  'Avoid mentioning HTML or CSS in the prompt',
                ],
                answer: 'Specify exact design tokens (colors, font families, radius, spacing values) and role constraints',
                explanation: 'Clear constraints and explicit design tokens guarantee brand consistency and clean output.',
              },
            },
          ],
        },
        {
          title: 'Module 5: Building Websites with AI Website Builders and Coding Assistants',
          objectives: 'Combine visual builders and code generators to construct multi-page websites in record time.',
          lessons: [
            {
              title: 'Assembling Full Pages in TROS Website Factory',
              position: 0,
              script:
                'In this lesson, we put theory into practice inside the TROS Website Factory. You will generate a complete 3-page business site, review the generated React/Tailwind code, and test interactive components inside our responsive preview sandbox.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'TROS Website Factory interface generating live HTML and CSS previews in real-time.',
                  narrationText: 'TROS Website Factory generates complete web applications ready for instant deployment.',
                  onScreenText: 'TROS Website Factory & Live Sandbox',
                  durationSeconds: 50,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nBuilding with modern AI website factories.',
              examples: 'Generating a dental clinic landing page with online booking form.',
              practicalDemonstrations: 'Using prompt directives to edit hero copy, swap color themes, and inject FAQ accordions.',
              exercises: 'Create your first project in TROS Website Factory and export the source files.',
              downloadableResources: 'TROS Website Factory Blueprint Starter Kit.',
              completionCriteria: 'Build and preview a working multi-section website.',
              quiz: {
                prompt: 'What is the primary role of a component sandbox in modern web development?',
                options: [
                  'It allows rapid visual testing of UI components in isolation across viewports before production deployment',
                  'It encrypts database passwords using blockchain hashing',
                  'It generates Bitcoin cryptocurrency during idle CPU cycles',
                  'It replaces the need for a web browser',
                ],
                answer: 'It allows rapid visual testing of UI components in isolation across viewports before production deployment',
                explanation: 'A component sandbox isolates UI styling and logic so developers can verify layouts without breaking production.',
              },
            },
          ],
        },
        {
          title: 'Module 6: Creating Responsive Layouts',
          objectives: 'Master fluid breakpoints, flexbox, CSS grid, mobile-first design, and touch interaction targets.',
          lessons: [
            {
              title: 'Mobile-First Architecture: Breakpoints and Fluid Grids',
              position: 0,
              script:
                'Over 60% of all global web traffic originates on mobile devices. Designing for desktop first and shrinking down leads to broken user experiences. In this lesson, we implement mobile-first styling using Tailwind CSS breakpoint prefixes: sm, md, lg, and xl.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Animated viewport shrinking from 1440px down to 375px showing seamless grid reflow.',
                  narrationText: 'Mobile-first design ensures your site delivers peak performance and readability on smartphones.',
                  onScreenText: 'Mobile-First Responsive Grids (sm / md / lg / xl)',
                  durationSeconds: 45,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nCreating responsive layouts that adapt anywhere.',
              examples: 'Transforming a 4-column desktop footer into a sleek mobile accordion.',
              practicalDemonstrations: 'Using Tailwind grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 utility classes.',
              exercises: 'Refactor a rigid desktop navigation bar into a responsive mobile drawer menu.',
              downloadableResources: 'Tailwind Responsive Breakpoints Cheatsheet.',
              completionCriteria: 'Verify mobile layout in TROS Sandbox at 375px viewport.',
              quiz: {
                prompt: 'In mobile-first CSS design, how are media queries constructed?',
                options: [
                  'Base styles target small screens, and min-width media queries add complexity as screen width expands',
                  'Base styles target 4K displays, and max-width queries shrink fonts',
                  'Styles are written exclusively in JavaScript runtime functions',
                  'Media queries are disabled to save bandwidth',
                ],
                answer: 'Base styles target small screens, and min-width media queries add complexity as screen width expands',
                explanation: 'Mobile-first methodology uses min-width queries so mobile devices load lightweight CSS first.',
              },
            },
          ],
        },
        {
          title: 'Module 7: Working with Images, Icons, and Brand Assets',
          objectives: 'Generate 2K/4K brand graphics with Gemini Nano Banana, optimize WebP/SVG formats, and maintain visual cohesion.',
          lessons: [
            {
              title: 'AI Asset Pipeline: Nano Banana 2.1 & SVG Iconography',
              position: 0,
              script:
                'High-converting websites demand bespoke visual assets. Stock photos look generic and dated. In this lesson, you will use Gemini Nano Banana 2.1 to generate photorealistic hero photography, editorial illustrations, and paired SVG icons that fit your color palette.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Prompt generating high-resolution 2K hero graphic with lighting tuned to brand palette.',
                  narrationText: 'Generate custom brand imagery that elevates your site above generic templates.',
                  onScreenText: 'Nano Banana 2.1 Brand Imagery & SVG Icons',
                  durationSeconds: 45,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nGenerating bespoke brand assets with AI.',
              examples: 'Hero image prompt styles: editorial 3D clay, hyper-minimalist studio lighting, glassmorphism icons.',
              practicalDemonstrations: 'Exporting assets to WebP format with next/image optimization.',
              exercises: 'Generate 3 cohesive hero background images using Nano Banana 2.1 in TROS Creative Studio.',
              downloadableResources: 'Brand Style Guide Template, SVG Icon Set Guide.',
              completionCriteria: 'Generate and integrate an AI brand asset into your project.',
              quiz: {
                prompt: 'Why is SVG preferred over PNG for logos and UI icons on websites?',
                options: [
                  'SVG is XML-based vector graphics, meaning it scales infinitely without pixelation and has tiny file sizes',
                  'SVG is the only format supported by Google Chrome',
                  'SVG files automatically play music when clicked',
                  'SVG files require specialized graphics cards to render',
                ],
                answer: 'SVG is XML-based vector graphics, meaning it scales infinitely without pixelation and has tiny file sizes',
                explanation: 'Scalable Vector Graphics (SVG) scale crisply to any resolution including Retina and 4K displays.',
              },
            },
          ],
        },
        {
          title: 'Module 8: Understanding Domains, Hosting, and Deployment',
          objectives: 'Demystify DNS records (A, CNAME), CDN edge networks, SSL certificates, and 1-click CI/CD deployment.',
          lessons: [
            {
              title: 'From Local to Global: Deploying with Custom Domains & SSL',
              position: 0,
              script:
                'A website is only as good as its live availability. In this lesson, you will master DNS records: A records pointing to IP addresses, CNAME records for subdomains, and how modern edge hosting platforms automate SSL certificate renewal and global CDN distribution.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Global CDN map demonstrating how edge caching reduces latency from 800ms down to 18ms.',
                  narrationText: 'Edge deployment serves your website from servers closest to your user worldwide.',
                  onScreenText: 'Global Edge Networks & Automatic SSL',
                  durationSeconds: 45,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nDeploying websites to global edge networks.',
              examples: 'Configuring a custom domain on Vercel with DNS verification.',
              practicalDemonstrations: 'Pushing code to GitHub and triggering automatic deployment preview builds.',
              exercises: 'Map out the DNS records required to attach a custom domain to a staging site.',
              downloadableResources: 'DNS Configuration Step-by-Step Guide PDF.',
              completionCriteria: 'Pass the hosting architecture assessment.',
              quiz: {
                prompt: 'What does a CNAME record do in domain name management?',
                options: [
                  'It maps an alias domain name (e.g., www.example.com) to a canonical domain name (e.g., cname.vercel-dns.com)',
                  'It encrypts email messages sent between company employees',
                  'It deletes expired cache cookies from browser memory',
                  'It registers a trademark with international copyright authorities',
                ],
                answer: 'It maps an alias domain name (e.g., www.example.com) to a canonical domain name (e.g., cname.vercel-dns.com)',
                explanation: 'A Canonical Name (CNAME) record maps one domain name alias to another canonical domain name.',
              },
            },
          ],
        },
        {
          title: 'Module 9: Basic Accessibility, Performance, and SEO',
          objectives: 'Achieve 95+ Google Lighthouse scores, implement semantic ARIA tags, and structure OpenGraph metadata.',
          lessons: [
            {
              title: 'Lighthouse 100: Web Vitals, Contrast, and Meta Tags',
              position: 0,
              script:
                'Clients do not just want pretty websites; they want websites that show up on Google search results and load in under 1 second. In this lesson, we optimize Core Web Vitals: Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and First Input Delay (FID), alongside WCAG AA accessibility.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Google Lighthouse audit report showing all four metrics hitting 100 in green.',
                  narrationText: 'High performance directly translates to higher conversions and superior search ranking.',
                  onScreenText: 'Core Web Vitals & WCAG AA Accessibility',
                  durationSeconds: 50,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nOptimizing for search engines and accessibility.',
              examples: 'Optimizing uncompressed 8MB hero image to a 65KB WebP with responsive srcset.',
              practicalDemonstrations: 'Running Lighthouse audits and fixing accessibility color contrast warnings.',
              exercises: 'Audit a webpage, identify 3 accessibility flaws, and implement fix tags.',
              downloadableResources: 'SEO & Performance Audit Master Checklist.',
              completionCriteria: 'Attain >90 score on performance and accessibility audit.',
              quiz: {
                prompt: 'Why is Cumulative Layout Shift (CLS) an essential metric for user experience?',
                options: [
                  'It measures unexpected visual shifts while content loads, preventing accidental user clicks on the wrong button',
                  'It measures how many visitors share the page on social media',
                  'It measures the electricity consumed by the server hosting the website',
                  'It calculates the price of purchasing a commercial SSL certificate',
                ],
                answer: 'It measures unexpected visual shifts while content loads, preventing accidental user clicks on the wrong button',
                explanation: 'A low CLS score ensures buttons and banners do not jump around while loading, protecting user trust.',
              },
            },
          ],
        },
        {
          title: 'Module 10: Testing, Debugging, and Improving a Website',
          objectives: 'Cross-browser testing, automated link checking, console error tracing, and systematic QA checklists.',
          lessons: [
            {
              title: 'Quality Assurance: The 25-Point Pre-Launch Audit',
              position: 0,
              script:
                'Never deliver a website to a client without running a comprehensive quality assurance audit. In this lesson, we test form validations, mobile viewport edge cases, broken outbound links, and 404 error handling.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Split view testing website simultaneously on iPhone, Android, iPad, and MacBook displays.',
                  narrationText: 'Rigorous pre-launch QA prevents embarrassing bugs and reinforces your professional agency reputation.',
                  onScreenText: 'The 25-Point Pre-Launch QA Protocol',
                  durationSeconds: 45,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nCross-browser QA and pre-launch protocol.',
              examples: 'Handling Safari iOS flexbox bugs and ensuring touch targets are at least 44x44 pixels.',
              practicalDemonstrations: 'Simulating slow 3G network conditions in Chrome DevTools to test fallback states.',
              exercises: 'Run the 25-point QA checklist on your capstone project draft.',
              downloadableResources: 'Agency Pre-Flight Launch Checklist Spreadsheet.',
              completionCriteria: 'Complete QA audit log with 0 critical errors.',
              quiz: {
                prompt: 'What is the minimum recommended touch target size for mobile web interactive buttons?',
                options: [
                  'At least 44 by 44 CSS pixels (or 48x48 on Android guidelines) with adequate spacing',
                  '12 by 12 CSS pixels to fit as many links as possible on screen',
                  '500 by 500 CSS pixels across all devices',
                  'Touch targets do not have recommended sizes',
                ],
                answer: 'At least 44 by 44 CSS pixels (or 48x48 on Android guidelines) with adequate spacing',
                explanation: 'Apple HIG and WCAG 2.1 recommend minimum 44x44px touch targets to accommodate human fingers without mis-taps.',
              },
            },
          ],
        },
        {
          title: 'Module 11: Client Briefs, Revisions, and Project Delivery',
          objectives: 'Handle client intake, set boundaries, manage revision rounds, and execute smooth project handoffs.',
          lessons: [
            {
              title: 'Agency Client Management: Briefs, Invoicing, and Handoff',
              position: 0,
              script:
                'Great web designers are not just artists; they are trusted business advisors. In this lesson, we teach you how to write clear client service agreements, limit revision rounds to 2 structured feedback cycles, and conduct a video walkthrough that delights your client.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Client onboarding portal in TROS showing project milestones, deliverables, and approval button.',
                  narrationText: 'Structure client expectations upfront with clear milestones and transparent deliverables.',
                  onScreenText: 'Client Onboarding, Revision Rules & Handoff',
                  durationSeconds: 50,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nManaging client briefs and professional delivery.',
              examples: 'Sample contract clause defining out-of-scope feature requests billed at hourly rates.',
              practicalDemonstrations: 'Recording a 3-minute client handover loom video explaining how to update site copy.',
              exercises: 'Draft a client project proposal using the TROS Client Management module.',
              downloadableResources: 'Web Design Client Contract Template, Client Onboarding Questionnaire.',
              completionCriteria: 'Submit a completed client proposal draft.',
              quiz: {
                prompt: 'What is "scope creep" and how does a professional designer prevent it?',
                options: [
                  'Uncontrolled growth in a project scope without adjustments to budget or deadlines; prevented with clear written specifications and formal change orders',
                  'A computer virus that corrupts server hard drives during deployment',
                  'A design trend that uses creeping drop shadows',
                  'A technique to reduce font sizes automatically',
                ],
                answer: 'Uncontrolled growth in a project scope without adjustments to budget or deadlines; prevented with clear written specifications and formal change orders',
                explanation: 'Scope creep degrades profitability; structured agreements protect both agency and client.',
              },
            },
          ],
        },
        {
          title: 'Module 12: Final Portfolio-Ready Website Project',
          objectives: 'Complete your capstone project, submit for automated and rubric grading, and claim your verifiable certificate.',
          lessons: [
            {
              title: 'Capstone Assembly, Verification & Certification',
              position: 0,
              script:
                'Congratulations on reaching the final milestone! You have mastered the fundamentals, prompt engineering, responsive grids, asset generation, and client delivery. In this final lesson, you will assemble your capstone portfolio website, run the final verification check, and claim your official TROS Verifiable Credential.',
              storyboard: [
                {
                  sceneNumber: 1,
                  visualDescription: 'Student certificate generating with unique cryptographic QR code and verifiable URL.',
                  narrationText: 'Your verified certificate showcases your practical mastery to clients and employers worldwide.',
                  onScreenText: 'Official TROS Certified AI Web Designer',
                  durationSeconds: 60,
                },
              ],
              captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:30.000\nFinal capstone evaluation and certification.',
              examples: 'Portfolio showcase examples that generated 5-figure freelance revenue.',
              practicalDemonstrations: 'Submitting project link for evaluation and exporting high-res certificate PDF.',
              exercises: 'Submit live project URL and review your peer score breakdown.',
              downloadableResources: 'Agency Portfolio Launchpad Pack, Verifiable Certificate Badge.',
              completionCriteria: 'Attain passing grade on all prior quizzes and submit capstone project URL.',
              quiz: {
                prompt: 'What is the most effective element of a web design portfolio to win high-paying clients?',
                options: [
                  'Case studies that clearly explain the client problem, the design solution, and the measurable business outcome',
                  'A list of software names without any screenshots or live links',
                  'A complex animated background that takes 30 seconds to load',
                  'A statement claiming to know every programming language in existence',
                ],
                answer: 'Case studies that clearly explain the client problem, the design solution, and the measurable business outcome',
                explanation: 'Commercial clients hire designers who solve business problems and deliver measurable ROI.',
              },
            },
          ],
        },
      ],
    }
  }

  // Generic subject fallback
  return {
    title: `Mastering ${topic} with AI`,
    subtitle: `The Complete Step-by-Step Curriculum for ${audience}`,
    topic,
    description: `A comprehensive, practical curriculum designed to take learners from core principles to practical mastery in ${topic} using modern AI workflows.`,
    targetAudience: audience,
    prerequisites: 'Basic familiarity with internet browsing and curiosity to learn.',
    learningOutcomes: [
      `Understand foundational principles of ${topic}.`,
      `Apply AI-driven workflows to accelerate execution in ${topic}.`,
      'Complete practical exercises and build real-world deliverables.',
      'Achieve verifiable certification upon course completion.',
    ],
    instructorBio: 'Reality Design Operations Team — AI business operations architects.',
    price: 99,
    salesHeadline: `Master ${topic} in 14 Days with AI`,
    salesPitch: `Learn ${topic} through an intensive, hands-on curriculum that integrates real-world tools, AI prompts, and step-by-step demonstrations.`,
    promoVideoPrompt: `Cinematic intro explaining the benefits of mastering ${topic} with AI assistance.`,
    glossary: [{ term: topic, definition: `The study and practical execution of ${topic}.` }],
    faqs: [{ question: 'How long does this course take?', answer: 'Approximately 2 to 4 weeks depending on your learning pace.' }],
    capstoneProject: {
      title: `${topic} Master Project`,
      brief: `Complete an end-to-end practical project applying all modules learned throughout this course.`,
      deliverables: ['Project documentation', 'Final live deliverable or artifact'],
      rubric: [{ criteria: 'Completeness', points: 50 }, { criteria: 'Execution Quality', points: 50 }],
    },
    emailSequence: [{ day: 1, subject: `Welcome to ${topic}`, body: 'Start your first module today!' }],
    socialPromo: [{ platform: 'Twitter/X', post: `Master ${topic} with our comprehensive AI course:`, callToAction: 'Enroll now' }],
    modules: [
      {
        title: `Module 1: Foundations of ${topic}`,
        objectives: `Understand the fundamental concepts and setup of ${topic}.`,
        lessons: [
          {
            title: `Introduction to ${topic}`,
            position: 0,
            script: `Welcome to this complete masterclass on ${topic}. In this lesson, we cover the core principles and prepare your environment.`,
            storyboard: [{ sceneNumber: 1, visualDescription: 'Introductory title card', narrationText: 'Welcome to the course.', onScreenText: topic, durationSeconds: 30 }],
            captionsVtt: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:20.000\nWelcome to the course.',
            examples: 'Core examples in practice.',
            practicalDemonstrations: 'Step-by-step walkthrough.',
            exercises: 'Complete your first exercise.',
            downloadableResources: 'Starter Cheatsheet PDF.',
            completionCriteria: 'Finish lesson and quiz.',
            quiz: {
              prompt: `What is a primary principle of ${topic}?`,
              options: ['Structured methodology and continuous iteration', 'Guesswork without measurement', 'Avoiding technology', 'None of the above'],
              answer: 'Structured methodology and continuous iteration',
              explanation: 'Effective execution relies on structured processes and continuous feedback.',
            },
          },
        ],
      },
    ],
  }
}
