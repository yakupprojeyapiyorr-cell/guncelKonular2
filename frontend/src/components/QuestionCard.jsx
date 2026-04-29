import React, { useState } from 'react'

export default function QuestionCard({ question, onAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [result, setResult] = useState(null)

  const handleSelectOption = async (optionIndex) => {
    if (showAnswer) return

    setSelectedOption(optionIndex)
    
    // Call API to verify answer
    if (onAnswer) {
      const response = await onAnswer(question.id, optionIndex)
      setResult(response)
      setShowAnswer(true)
    }
  }

  const getOptionState = (index) => {
    if (!showAnswer) {
      return selectedOption === index ? 'selected' : 'idle'
    }

    if (result.correctOption === index) {
      return 'correct'
    }

    if (selectedOption === index) {
      return result.isCorrect ? 'correct' : 'wrong'
    }

    return 'dimmed'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Question Image */}
      {question.imageUrl && (
        <div className="bg-gray-100 p-6">
          <img
            src={question.imageUrl}
            alt="Soru"
            className="max-w-full h-auto mx-auto max-h-96"
          />
        </div>
      )}

      {/* Question Text */}
      {question.questionText && (
        <div className="p-6 bg-blue-50 border-b-2 border-blue-200">
          <p className="text-gray-900 text-lg">{question.questionText}</p>
        </div>
      )}

      {/* Options */}
      <div className="p-6 space-y-3">
        {question.options.map((option, idx) => {
          const state = getOptionState(idx)
          const optionLetter = String.fromCharCode(65 + idx) // A, B, C, D, E

          return (
            <OptionButton
              key={idx}
              letter={optionLetter}
              text={option.text}
              whyText={option.whyText}
              state={state}
              onClick={() => handleSelectOption(idx)}
              disabled={showAnswer}
            />
          )
        })}
      </div>

      {/* Explanation */}
      {showAnswer && result && (
        <div className="p-6 bg-gray-50 border-t-2 border-gray-200">
          <div
            className={`p-4 rounded-lg ${
              result.isCorrect
                ? 'bg-green-50 border-2 border-green-300'
                : 'bg-red-50 border-2 border-red-300'
            }`}
          >
            <h4 className={`font-bold mb-2 ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {result.isCorrect ? '✓ Doğru!' : '✗ Yanlış'}
            </h4>
            <p className={`text-sm ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {result.generalExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Next Button */}
      {showAnswer && (
        <div className="p-6 bg-gray-100 border-t">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition">
            Sonraki Soru →
          </button>
        </div>
      )}
    </div>
  )
}

function OptionButton({ letter, text, whyText, state, onClick, disabled }) {
  const baseClasses =
    'w-full p-4 rounded-lg border-2 text-left transition transform cursor-pointer'

  const stateClasses = {
    idle: 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50',
    selected: 'bg-blue-50 border-blue-500 ring-2 ring-blue-200',
    correct: 'bg-green-100 border-green-500 ring-2 ring-green-200 animate-pulse',
    wrong: 'bg-red-100 border-red-500 ring-2 ring-red-200 animate-shake',
    dimmed: 'bg-gray-100 border-gray-300 opacity-60',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled && state === 'idle'}
      className={`${baseClasses} ${stateClasses[state]}`}
    >
      <div className="flex items-start gap-3">
        <span className="font-bold text-lg text-gray-700 min-w-8">{letter}.</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{text}</p>
          {state !== 'idle' && state !== 'selected' && whyText && (
            <p className="text-xs mt-2 text-gray-700 opacity-75">{whyText}</p>
          )}
        </div>
      </div>
    </button>
  )
}
