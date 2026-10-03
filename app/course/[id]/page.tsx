import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function CourseStudentView({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar: Modules and Lessons */}
      <div className="w-80 bg-white border-r h-screen overflow-y-auto p-4">
        <h2 className="text-xl font-bold mb-6 text-gray-800">{course.title}</h2>
        
        {course.modules.map(mod => (
          <div key={mod.id} className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Module {mod.position}: {mod.title}</h3>
            <ul className="space-y-2 pl-4">
              {mod.lessons.sort((a, b) => a.position - b.position).map(lesson => (
                <li key={lesson.id} className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 flex items-center gap-2">
                  <div className="w-4 h-4 border rounded-full"></div>
                  {lesson.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black aspect-video w-full rounded-xl flex items-center justify-center text-white mb-8">
            <span className="text-gray-400">Video Player (Requires Selection)</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{course.title} - Overview</h1>
          <div className="flex gap-4 mb-8 text-sm text-gray-500">
            <span><strong>Target Audience:</strong> {course.targetAudience}</span>
            <span><strong>Prerequisites:</strong> {course.prerequisites}</span>
          </div>

          <div className="prose max-w-none">
            <h3>Description</h3>
            <p>{course.description}</p>
            
            <h3>Learning Outcomes</h3>
            <p>{course.learningOutcomes}</p>
          </div>
          
          {course.status !== 'PUBLISHED' && (
            <div className="mt-8 bg-yellow-100 text-yellow-800 p-4 rounded-md">
              This course is currently in <strong>{course.status}</strong> mode.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
