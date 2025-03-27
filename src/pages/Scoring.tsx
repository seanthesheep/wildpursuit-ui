import React, { useState, useEffect } from 'react';
import { Info, Download, Camera, ArrowLeft, ArrowRight } from 'react-feather';

type MeasurementType = 'typical' | 'non-typical';
type MeasurementUnit = 'inches' | 'centimeters';

interface Measurements {
  // Inside spread
  insideSpread: number;

  // Main Beams
  rightMainBeam: number;
  leftMainBeam: number;

  // Tines (G measurements)
  rightG1: number; // brow tine
  rightG2: number; // G2 tine
  rightG3: number; // G3 tine
  rightG4: number; // G4 tine
  rightG5: number; // G5 tine (optional)
  rightG6: number; // G6 tine (optional)
  leftG1: number;
  leftG2: number;
  leftG3: number;
  leftG4: number;
  leftG5: number;
  leftG6: number;

  // Circumferences (H measurements)
  rightH1: number; // between burr and G1
  rightH2: number; // between G1 and G2
  rightH3: number; // between G2 and G3
  rightH4: number; // between G3 and G4
  leftH1: number;
  leftH2: number;
  leftH3: number;
  leftH4: number;

  // Abnormal points (for non-typical)
  abnormalPoints: number;
}

const initialMeasurements: Measurements = {
  insideSpread: 0,
  rightMainBeam: 0,
  leftMainBeam: 0,
  rightG1: 0,
  rightG2: 0,
  rightG3: 0,
  rightG4: 0,
  rightG5: 0,
  rightG6: 0,
  leftG1: 0,
  leftG2: 0,
  leftG3: 0,
  leftG4: 0,
  leftG5: 0,
  leftG6: 0,
  rightH1: 0,
  rightH2: 0,
  rightH3: 0,
  rightH4: 0,
  leftH1: 0,
  leftH2: 0,
  leftH3: 0,
  leftH4: 0,
  abnormalPoints: 0,
};

const ScoringCalculator: React.FC = () => {
  const [measurementType, setMeasurementType] = useState<MeasurementType>('typical');
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('inches');
  const [measurements, setMeasurements] = useState<Measurements>(initialMeasurements);
  const [totalScore, setTotalScore] = useState(0);
  const [step, setStep] = useState(1);
  const [showInstructions, setShowInstructions] = useState(false);

  // Calculate total score whenever measurements change
  useEffect(() => {
    const calculateScore = () => {
      // 1. Add inside spread
      let score = measurements.insideSpread;

      // 2. Add main beams
      score += measurements.rightMainBeam + measurements.leftMainBeam;

      // 3. Add tines
      score += measurements.rightG1 + measurements.rightG2 + measurements.rightG3 + measurements.rightG4 +
               measurements.rightG5 + measurements.rightG6;
      score += measurements.leftG1 + measurements.leftG2 + measurements.leftG3 + measurements.leftG4 +
               measurements.leftG5 + measurements.leftG6;

      // 4. Add circumferences
      score += measurements.rightH1 + measurements.rightH2 + measurements.rightH3 + measurements.rightH4;
      score += measurements.leftH1 + measurements.leftH2 + measurements.leftH3 + measurements.leftH4;

      // 5. For non-typical, add abnormal points
      if (measurementType === 'non-typical') {
        score += measurements.abnormalPoints;
      }

      // Round to nearest 1/8 inch (Boone & Crockett style)
      score = Math.round(score * 8) / 8;

      return score;
    };

    setTotalScore(calculateScore());
  }, [measurements, measurementType]);

  // Handle input change
  const handleMeasurementChange = (field: keyof Measurements, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setMeasurements({
      ...measurements,
      [field]: numValue,
    });
  };

  // Navigate between steps
  const goToNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Reset calculator
  const resetCalculator = () => {
    setMeasurements(initialMeasurements);
    setStep(1);
  };

  // Render measurement input
  const renderMeasurementInput = (label: string, field: keyof Measurements) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex">
          <input
            type="number"
            min="0"
            step="0.125"
            value={measurements[field] || ''}
            onChange={(e) => handleMeasurementChange(field, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder={`0 ${measurementUnit === 'inches' ? 'in' : 'cm'}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-100 overflow-auto p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-600 text-white p-4 flex justify-between">
          <h1 className="text-xl font-bold">WHITETAIL DEER SCORING CALCULATOR</h1>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-white hover:bg-green-700 p-1 rounded-full"
          >
            <Info size={20} />
          </button>
        </div>

        {showInstructions && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-100">
            <h2 className="font-bold text-lg mb-2">How to Measure</h2>
            <p className="mb-2">
              This calculator follows Boone & Crockett scoring methods. Measurements should be taken to the nearest 1/8 inch.
            </p>
            <div className="flex justify-center mt-4">
              <img
                src="https://same-assets.com/b2db5d51-9f30-4c14-83ea-8a29303b7c6d.jpeg"
                alt="Scoring diagram"
                className="max-w-full h-auto max-h-64"
              />
            </div>
            <ul className="list-disc pl-5 mt-3 text-sm">
              <li>Inside Spread: Measure from the widest inside points of the main beams</li>
              <li>Main Beams: Measure from the base of the burr to the tip along the outside curve</li>
              <li>Tines (G Measurements): Measure from the main beam to the tip along the outer edge</li>
              <li>Circumferences (H Measurements): Measure the smallest circumference at each point</li>
            </ul>
          </div>
        )}

        <div className="p-6">
          {/* Configuration Options */}
          <div className="flex flex-wrap mb-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scoring Type</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setMeasurementType('typical')}
                  className={`px-4 py-2 rounded-md ${
                    measurementType === 'typical'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Typical
                </button>
                <button
                  onClick={() => setMeasurementType('non-typical')}
                  className={`px-4 py-2 rounded-md ${
                    measurementType === 'non-typical'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Non-Typical
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setMeasurementUnit('inches')}
                  className={`px-4 py-2 rounded-md ${
                    measurementUnit === 'inches'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Inches
                </button>
                <button
                  onClick={() => setMeasurementUnit('centimeters')}
                  className={`px-4 py-2 rounded-md ${
                    measurementUnit === 'centimeters'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Centimeters
                </button>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mb-6">
            <div className="flex mb-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`flex-1 h-2 ${
                    stepNum <= step ? 'bg-green-600' : 'bg-gray-200'
                  } ${stepNum > 1 ? 'ml-1' : ''}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Main Beam & Spread</span>
              <span>Tines</span>
              <span>Circumferences</span>
              <span>Results</span>
            </div>
          </div>

          {/* Step 1: Main Beam & Spread */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Step 1: Main Beam & Inside Spread</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {renderMeasurementInput('Inside Spread', 'insideSpread')}
                </div>
                <div className="flex justify-center items-center">
                  <img
                    src="https://same-assets.com/b2db5d51-9f30-4c14-83ea-8a29303b7c6d.jpeg"
                    alt="Inside spread"
                    className="max-h-32"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  {renderMeasurementInput('Right Main Beam', 'rightMainBeam')}
                </div>
                <div>
                  {renderMeasurementInput('Left Main Beam', 'leftMainBeam')}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={goToNextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-md flex items-center"
                >
                  Next <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Tines */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Step 2: Tine Measurements (G-Series)</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Right Antler Tines</h3>
                  <div className="space-y-2">
                    {renderMeasurementInput('G1 (Brow Tine)', 'rightG1')}
                    {renderMeasurementInput('G2', 'rightG2')}
                    {renderMeasurementInput('G3', 'rightG3')}
                    {renderMeasurementInput('G4', 'rightG4')}
                    {renderMeasurementInput('G5 (if present)', 'rightG5')}
                    {renderMeasurementInput('G6 (if present)', 'rightG6')}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Left Antler Tines</h3>
                  <div className="space-y-2">
                    {renderMeasurementInput('G1 (Brow Tine)', 'leftG1')}
                    {renderMeasurementInput('G2', 'leftG2')}
                    {renderMeasurementInput('G3', 'leftG3')}
                    {renderMeasurementInput('G4', 'leftG4')}
                    {renderMeasurementInput('G5 (if present)', 'leftG5')}
                    {renderMeasurementInput('G6 (if present)', 'leftG6')}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={goToPreviousStep}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md flex items-center"
                >
                  <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <button
                  onClick={goToNextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-md flex items-center"
                >
                  Next <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Circumferences */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Step 3: Circumference Measurements (H-Series)</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Right Antler Circumferences</h3>
                  <div className="space-y-2">
                    {renderMeasurementInput('H1 (Between burr and G1)', 'rightH1')}
                    {renderMeasurementInput('H2 (Between G1 and G2)', 'rightH2')}
                    {renderMeasurementInput('H3 (Between G2 and G3)', 'rightH3')}
                    {renderMeasurementInput('H4 (Between G3 and G4)', 'rightH4')}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Left Antler Circumferences</h3>
                  <div className="space-y-2">
                    {renderMeasurementInput('H1 (Between burr and G1)', 'leftH1')}
                    {renderMeasurementInput('H2 (Between G1 and G2)', 'leftH2')}
                    {renderMeasurementInput('H3 (Between G2 and G3)', 'leftH3')}
                    {renderMeasurementInput('H4 (Between G3 and G4)', 'leftH4')}
                  </div>
                </div>
              </div>

              {measurementType === 'non-typical' && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Abnormal Points</h3>
                  {renderMeasurementInput('Total Length of Abnormal Points', 'abnormalPoints')}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={goToPreviousStep}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md flex items-center"
                >
                  <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <button
                  onClick={goToNextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-md flex items-center"
                >
                  Calculate Score <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Final Score</h2>

              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600">{totalScore.toFixed(3)}</div>
                  <div className="text-gray-500 mt-2">
                    {measurementType === 'typical' ? 'Typical' : 'Non-Typical'} Boone & Crockett Score
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-medium mb-3">Classification</h3>
                <div className="bg-gray-100 p-4 rounded-md">
                  {totalScore >= 170 ? (
                    <div className="text-green-700">
                      <span className="font-bold">Boone & Crockett Record Book Qualifier</span>
                      <p className="text-sm mt-1">
                        This score would qualify for the Boone & Crockett record book as a typical whitetail deer.
                      </p>
                    </div>
                  ) : totalScore >= 160 ? (
                    <div className="text-blue-700">
                      <span className="font-bold">Pope & Young Record Book Qualifier</span>
                      <p className="text-sm mt-1">
                        This score would qualify for the Pope & Young record book as a typical whitetail deer.
                      </p>
                    </div>
                  ) : totalScore >= 140 ? (
                    <div className="text-orange-700">
                      <span className="font-bold">Trophy Class Buck</span>
                      <p className="text-sm mt-1">
                        This is considered a trophy-class whitetail in most hunting regions.
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-700">
                      <span className="font-bold">Quality Buck</span>
                      <p className="text-sm mt-1">
                        This is a quality whitetail buck that would be a great harvest for most hunters.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={goToPreviousStep}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md flex items-center"
                >
                  <ArrowLeft size={16} className="mr-2" /> Edit Measurements
                </button>
                <button
                  onClick={resetCalculator}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  Reset Calculator
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center">
                  <Download size={16} className="mr-2" /> Save Results
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center">
                  <Camera size={16} className="mr-2" /> Add Photos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoringCalculator;
