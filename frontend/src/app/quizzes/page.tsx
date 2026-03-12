import { QuizList } from "@/features/quiz/QuizList";

export default function QuizzesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Explore Quizzes</h1>
        <p className="text-slate-600">Find a quiz that interests you and test your knowledge.</p>
      </div>
      <QuizList />
    </div>
  );
}
