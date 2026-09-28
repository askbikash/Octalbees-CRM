const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultTemplates = [
  {
    name: 'Student — Detailed Internship Introduction',
    audience: 'STUDENT',
    category: 'INTRODUCTION',
    subject: 'Internship Opportunity at Octalbees – Gain Real-World Industry Experience',
    variables: 'student_name,program_name,duration,mode,start_date',
    body: `Hi {{student_name}},

Greetings from Octalbees!

We're reaching out to share internship opportunities designed for students and freshers who want to gain practical industry experience and work on real-world projects.

We currently offer internship opportunities across multiple domains:

**Technology & Development**
• Full Stack Development
• Frontend Development
• Backend Development
• Software Development
• AI Software Development
• Python Development
• Java Development
• Mobile App Development

**Data & AI**
• Data Science
• Data Analytics
• Artificial Intelligence
• Machine Learning

**Creative & Business**
• UI/UX Design
• Digital Marketing
• Business Development
• Sales & Marketing

The internship focuses on practical learning rather than only theoretical concepts. Depending on the role, interns may work on projects, assignments, research, data analysis, application development, AI/ML tasks, marketing activities, or business development activities.

**Internship Highlights**
✅ Real-world project exposure
✅ Industry-relevant tools and technologies
✅ Mentor guidance
✅ Practical assignments
✅ Professional Git/GitHub workflow for technical roles
✅ Internship certificate upon successful completion
✅ Letter of Recommendation based on performance
✅ Opportunities for high-performing interns

**Program:** {{program_name}}
**Duration:** {{duration}}
**Mode:** {{mode}}
**Start Date:** {{start_date}}

If you're interested in gaining practical experience and strengthening your resume and portfolio, simply reply "Interested" and our team will share the next steps.

Best Regards,
Team Octalbees`,
  },
  {
    name: 'Student — Career & Portfolio Focus',
    audience: 'STUDENT',
    category: 'CAREER_PITCH',
    subject: 'Build Your Portfolio with a Practical Internship at Octalbees',
    variables: 'student_name,duration,mode',
    body: `Hi {{student_name}},

Are you currently looking for an internship where you can gain practical experience, work on projects, and strengthen your resume and portfolio?

Octalbees offers project-based internship opportunities for students and freshers across multiple domains.

**Available Internship Roles**
• Data Science Intern
• Data Analytics Intern
• AI / Machine Learning Intern
• AI Software Development Intern
• Full Stack Development Intern
• Frontend Development Intern
• Backend Development Intern
• Software Development Intern
• Python Development Intern
• Java Development Intern
• Mobile App Development Intern
• UI/UX Design Intern
• Digital Marketing Intern
• Business Development Intern
• Sales & Marketing Intern

Depending on the role, interns get exposure to practical projects, assignments, mentorship, industry tools, collaborative workflows, and professional work practices.

**Program Highlights**
✅ Hands-on project experience
✅ Industry-relevant technologies and tools
✅ Mentor guidance
✅ Practical assignments and evaluations
✅ Git/GitHub workflow for technical roles
✅ Internship certificate upon successful completion
✅ LOR based on performance
✅ Potential opportunities for high-performing interns

**Duration:** {{duration}}
**Mode:** {{mode}}

If you're interested, simply reply "Interested" and our team will guide you through the application process.

Best Regards,
Team Octalbees`,
  },
  {
    name: 'Student — Follow-Up',
    audience: 'STUDENT',
    category: 'FOLLOW_UP',
    subject: 'Follow-Up: {{program_name}} Internship at Octalbees',
    variables: 'student_name,program_name',
    body: `Hi {{student_name}},

I'm following up regarding the {{program_name}} internship opportunity we recently shared with you.

The internship is focused on helping students gain practical experience through real-world projects, mentorship, assignments, and industry-relevant development practices.

Depending on your area of interest, opportunities are available in domains such as:
• Data Science
• Data Analytics
• AI & Machine Learning
• AI Software Development
• Full Stack Development
• Software Development
• Python / Java Development
• Mobile App Development
• UI/UX Design
• Digital Marketing
• Business Development

If you're currently looking for an opportunity to gain practical experience and strengthen your resume or portfolio, we'd be happy to guide you through the process.

If interested, simply reply "Interested" and we'll share the next steps.

Best Regards,
Team Octalbees`,
  },
  {
    name: 'Student — No Response / Re-engagement',
    audience: 'STUDENT',
    category: 'RE_ENGAGEMENT',
    subject: 'Still Interested in the {{program_name}} Internship?',
    variables: 'student_name,program_name',
    body: `Hi {{student_name}},

We wanted to check if you're still interested in the {{program_name}} internship opportunity at Octalbees.

The program is designed for students and freshers who want to gain practical exposure through projects, assignments, mentorship, and industry-relevant workflows.

If you're interested, simply reply "Interested", and our team will share the complete details and next steps.

If you have any questions about the internship, feel free to reply and we'll be happy to help.

Best Regards,
Team Octalbees`,
  },
  {
    name: 'Student — Next Steps After Interest',
    audience: 'STUDENT',
    category: 'NEXT_STEPS',
    subject: 'Next Steps for Your {{program_name}} Internship at Octalbees',
    variables: 'student_name,program_name,duration,mode,next_step',
    body: `Hi {{student_name}},

Thank you for your interest in the {{program_name}} internship at Octalbees.

We'd be happy to move forward with your application.

Please complete the following step:
{{next_step}}

Once completed, our team will review your details and get back to you with the next update.

**Internship Program**
**Role:** {{program_name}}
**Duration:** {{duration}}
**Mode:** {{mode}}

We look forward to having you join the Octalbees internship program.

Best Regards,
Team Octalbees`,
  },
  {
    name: 'Student — Final Follow-Up',
    audience: 'STUDENT',
    category: 'FINAL_FOLLOW_UP',
    subject: 'Final Follow-Up – {{program_name}} Internship',
    variables: 'student_name,program_name',
    body: `Hi {{student_name}},

This is a final follow-up regarding the {{program_name}} internship opportunity at Octalbees.

If you're still interested, please let us know by replying to this email. We'll be happy to help you with the next steps.

If we don't hear from you, we'll assume you're not looking to proceed at this time.

Thank you for your time and interest in Octalbees.

Best Regards,
Team Octalbees`,
  },
  {
    name: 'Placement Cell — First Collaboration Email',
    audience: 'PLACEMENT_CELL',
    category: 'COLLABORATION',
    subject: 'Internship Opportunities for Students – Industry Collaboration with Octalbees',
    variables: 'placement_officer_name,college_name,contact_details',
    body: `Dear {{placement_officer_name}},

Greetings from Octalbees!

We are reaching out to explore an internship collaboration with {{college_name}} to provide students with practical industry exposure and project-based internship opportunities.

Octalbees currently offers internship programs across Technology, Data, AI, Design, Marketing, and Business domains.

**Available Internship Domains**

**Technology & Software Development**
• Full Stack Development Intern
• Frontend Development Intern
• Backend Development Intern
• Software Development Intern
• AI Software Development Intern
• Python Development Intern
• Java Development Intern
• Mobile App Development Intern

**Data & Artificial Intelligence**
• Data Science Intern
• Data Analytics Intern
• Artificial Intelligence Intern
• Machine Learning Intern

**Design & Business**
• UI/UX Design Intern
• Digital Marketing Intern
• Business Development Intern
• Sales & Marketing Intern

Our internship programs are structured to help students bridge the gap between academic learning and practical industry requirements through hands-on projects, assignments, mentorship, and professional workflows.

**Internship Highlights**
✅ Project-based practical learning
✅ Industry-relevant technologies and tools
✅ Mentor guidance
✅ Practical assignments and evaluations
✅ Professional development workflows
✅ Internship certificate upon successful completion
✅ LOR based on performance
✅ Opportunities for high-performing students

We would be happy to share our detailed internship proposal, role descriptions, eligibility criteria, duration, selection process, and internship structure with your placement/training team.

If your institution is currently looking for internship opportunities for students, we would be glad to discuss a possible collaboration.

Looking forward to hearing from you.

Best Regards,
Team Octalbees
{{contact_details}}`,
  },
  {
    name: 'Placement Cell — Follow-Up Email',
    audience: 'PLACEMENT_CELL',
    category: 'FOLLOW_UP',
    subject: 'Follow-Up: Internship Collaboration with Octalbees',
    variables: 'placement_officer_name,college_name,contact_details',
    body: `Dear {{placement_officer_name}},

Greetings from Octalbees.

I'm following up regarding our previous email about internship opportunities for students of {{college_name}}.

We would be happy to collaborate with your placement/training team and provide students with opportunities to gain practical experience through project-based internships.

We can share the following details with your team:
• Available internship roles
• Eligibility criteria
• Duration and mode
• Technology/skill requirements
• Selection process
• Internship structure
• Certificate and performance-based opportunities

Our internship opportunities include roles in Data Science, Data Analytics, AI/ML, AI Software Development, Full Stack Development, Software Development, Python, Java, Mobile App Development, UI/UX, Digital Marketing, Business Development, and Sales & Marketing.

Please let us know if we can share the detailed internship proposal and role descriptions for your consideration.

Looking forward to your response.

Best Regards,
Team Octalbees
{{contact_details}}`,
  },
  {
    name: 'Placement Cell — Detailed Proposal',
    audience: 'PLACEMENT_CELL',
    category: 'PROPOSAL',
    subject: 'Internship Program Proposal for {{college_name}} – Octalbees',
    variables: 'placement_officer_name,college_name,duration,mode,start_date,contact_details',
    body: `Dear {{placement_officer_name}},

Greetings from Octalbees!

We are pleased to introduce Octalbees as an organization offering practical, project-based internship opportunities for students and freshers.

We would like to explore a potential internship collaboration with {{college_name}} and provide your students with opportunities to gain exposure to real-world projects and industry practices.

**Internship Domains**

**Data & AI**
• Data Science
• Data Analytics
• Artificial Intelligence
• Machine Learning
• AI Software Development

**Software & Development**
• Full Stack Development
• Frontend Development
• Backend Development
• Software Development
• Python Development
• Java Development
• Mobile App Development

**Business & Creative**
• UI/UX Design
• Digital Marketing
• Business Development
• Sales & Marketing

**What Students Can Gain**
✅ Real-world project development
✅ Practical assignments
✅ Industry tools and technologies
✅ Mentorship and technical guidance
✅ Team collaboration
✅ Git/GitHub and professional workflows
✅ Problem-solving and project execution
✅ Resume and portfolio building
✅ Internship certificate upon successful completion
✅ LOR based on performance
✅ Potential opportunities for high-performing students

**Internship Duration:** {{duration}}
**Mode:** {{mode}}
**Expected Start Date:** {{start_date}}

We would be glad to provide your placement/training team with detailed role descriptions, eligibility criteria, internship structure, and the selection process.

Please let us know the appropriate contact person or email address for sharing the complete proposal.

Thank you for your time. We look forward to the possibility of working with {{college_name}}.

Best Regards,
Team Octalbees
{{contact_details}}`,
  },
  {
    name: 'Placement Cell — Short Initial Outreach',
    audience: 'PLACEMENT_CELL',
    category: 'SHORT_OUTREACH',
    subject: 'Internship Collaboration Opportunity – Octalbees',
    variables: 'placement_officer_name,college_name,contact_details',
    body: `Dear {{placement_officer_name}},

Greetings from Octalbees!

We are reaching out to explore an internship collaboration with {{college_name}} for your students.

We currently offer project-based internship opportunities across:
• Data Science
• Data Analytics
• AI & Machine Learning
• AI Software Development
• Full Stack Development
• Software Development
• Python / Java Development
• Mobile App Development
• UI/UX Design
• Digital Marketing
• Business Development & Sales

Our programs focus on practical projects, mentorship, industry-relevant skills, and hands-on experience.

We would be happy to share our detailed internship proposal and role descriptions with your placement/training team.

Could you please let us know the appropriate email/contact where we can send the details?

Regards,
Team Octalbees
{{contact_details}}`,
  },
];

async function seedTemplates() {
  console.log('🌱 Seeding email templates...');

  for (const tmpl of defaultTemplates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: tmpl.name, is_default: true },
    });

    if (!existing) {
      await prisma.emailTemplate.create({
        data: { ...tmpl, is_default: true },
      });
      console.log(`  ✅ Created: ${tmpl.name}`);
    } else {
      console.log(`  ⏭️  Skipped (exists): ${tmpl.name}`);
    }
  }

  console.log('✅ Email templates seeded!');
}

module.exports = { seedTemplates };

// Run directly if called from CLI
if (require.main === module) {
  seedTemplates()
    .then(() => prisma.$disconnect())
    .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
}
