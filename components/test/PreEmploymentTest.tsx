import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../../App';
import { Candidate, UserRole } from '../../types';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { TEST_QUESTIONS } from './testData';

interface PreEmploymentTestProps {
  candidate: Candidate;
  onTestComplete: () => void;
}

const TOTAL_TIME = 10 * 60; // 10 minutes in seconds

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const PreEmploymentTest: React.FC<PreEmploymentTestProps> = ({ candidate, onTestComplete }) => {
  const { updateCandidate } = useContext(AppContext);
  
  const shuffledQuestions = useMemo(() => {
    return TEST_QUESTIONS.map(question => ({
      ...question,
      options: shuffleArray(question.options)
    }));
  }, []);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerSelect = (questionId: string, answerKey: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerKey }));
    // Automatically move to the next question after a brief delay for UX
    setTimeout(() => {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, 300);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (isFinished) return;

    let score = 0;
    // Iterate over the original TEST_QUESTIONS to ensure correct answer checking
    TEST_QUESTIONS.forEach(q => {
      const selectedAnswerKey = answers[q.id];
      if (selectedAnswerKey) {
        // Find the correct option from the original question data
        const correctOption = q.options.find(opt => opt.isCorrect);
        // Check if the user's selected answer key matches the correct answer key
        if (correctOption && correctOption.key === selectedAnswerKey) {
          score++;
        }
      }
    });

    const updatedCandidate: Candidate = {
      ...candidate,
      preEmploymentTest: {
        score,
        answers,
        completedAt: new Date().toISOString(),
      },
      statusHistory: [
          ...candidate.statusHistory,
          { id: `log_${Date.now()}`, timestamp: new Date().toISOString(), user: candidate.fullName, role: UserRole.Candidate, action: `Pre-Employment Test Completed (Score: ${score})` }
      ]
    };

    updateCandidate(updatedCandidate);
    setFinalScore(score);
    setIsFinished(true);
  };
  
  const getTestRating = (score: number) => {
    if (score >= 35) return { text: '⭐ Excellent', color: 'text-casino-success' };
    if (score >= 28) return { text: '✅ Good', color: 'text-teal-400' };
    if (score >= 20) return { text: '⚙️ Average', color: 'text-casino-warning' };
    return { text: '❌ Below Average', color: 'text-casino-danger' };
  };

  if (isFinished) {
    const rating = getTestRating(finalScore);
    return (
       <div className="bg-casino-primary min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <h1 className="text-3xl font-bold text-casino-gold mb-2">Test Completed!</h1>
          <p className="text-casino-text-muted mb-6">Thank you for your time. Here is your result.</p>
          <div className="my-8">
             <p className="text-casino-text-muted text-lg">Your Score</p>
             <p className="text-6xl font-bold text-casino-gold my-2">{finalScore} <span className="text-3xl text-casino-text-muted">/ 40</span></p>
             <p className={`text-2xl font-bold ${rating.color}`}>{rating.text}</p>
          </div>
          <p className="text-casino-text-muted mt-2 mb-8">
            Our HR team will review your application and test results and will get in touch with you shortly.
          </p>
          <button onClick={onTestComplete} className="w-full bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
            Finish & Return Home
          </button>
        </Card>
      </div>
    );
  }
  
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="bg-casino-primary min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <div className="border-b border-gray-700 pb-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-casino-gold">Pre-Employment Test</h1>
            <div className="flex items-center space-x-2 bg-casino-secondary px-3 py-1 rounded-full text-lg font-semibold">
              <Icon name="clock" className="w-5 h-5 text-casino-gold"/>
              <span className={timeLeft < 60 ? 'text-casino-danger' : 'text-casino-text'}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="w-full bg-casino-secondary rounded-full h-2.5">
            <div className="bg-casino-gold h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-right text-casino-text-muted mt-1">Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-casino-text-muted mb-2">🧠 {currentQuestion.section}</h2>
          <div className="text-2xl text-casino-text mb-6 min-h-[6rem] flex items-center">{currentQuestion.text}</div>

          <div className="space-y-4">
            {currentQuestion.options.map(option => (
              <label key={option.key} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${answers[currentQuestion.id] === option.key ? 'bg-casino-accent border-casino-gold text-casino-primary' : 'bg-casino-secondary border-gray-600 hover:border-casino-accent'}`}>
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.key}
                  checked={answers[currentQuestion.id] === option.key}
                  onChange={() => handleAnswerSelect(currentQuestion.id, option.key)}
                  className="hidden"
                />
                <span className={`font-bold mr-4 text-lg ${answers[currentQuestion.id] === option.key ? 'text-casino-primary' : 'text-casino-gold'}`}>{option.key}</span>
                <span className="text-lg">{option.text}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
          <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          {currentQuestionIndex === shuffledQuestions.length - 1 && (
            <button onClick={handleSubmit} className="bg-casino-success hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center transition-colors">
              Submit Test
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};