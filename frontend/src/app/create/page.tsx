import { QuizCreator } from "@/features/quiz/QuizCreator";

export default function CreateQuizPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create a New Quiz</h1>
        <p className="text-slate-600">Design your questions, set the correct answers, and publish instantly.</p>
      </div>
      <QuizCreator />
    </div>
  );
}
