
import React from 'react';

interface IconGreenProps {
  icon: React.ReactNode;
}

export default function IconBlue({ icon }: IconGreenProps) {
  return (
    <div className='bg-skyBlue p-2 rounded-[50%]'>
      <div className='bg-lightBlue p-2 rounded-[50%] text-[#005FAB]'>{icon}</div>
    </div>
  );
}
