import React from 'react';
import { ButtonPrimary } from '../components/ButtonPrimary';
import logoImage from 'figma:asset/766253ad1c0235a97d8d200e2889c88b9bd34c4e.png';

interface SplashScreenProps {
  onStart: () => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5ED] via-[#F4CDA5] to-[#D1A27B] flex flex-col items-center justify-center p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-48 h-48 mb-6">
          <img
            src={logoImage}
            alt="Meowtrition Logo"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <h1 
          className="text-[#3B2E25] mb-3 text-center" 
          style={{ fontFamily: '"Grand Hotel", cursive', fontSize: '4rem', lineHeight: '1.2' }}
        >
          Meowtrition
        </h1>
        <p className="text-[#6E5C50] text-center max-w-sm px-4">
          Feed with love, guided by science.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <ButtonPrimary onClick={onStart}>Get Started</ButtonPrimary>
      </div>
    </div>
  );
}
