'use client';

interface RatingProps {
  rate?: number;
  fiveStar?: boolean;
}

export default function Rating({ rate = 5, fiveStar = false }: RatingProps) {
  return <>{fiveStar ? <FiveStar rate={rate} /> : <OneStar rate={rate} />}</>;
}

interface StarProps {
  fraction?: number;
}

function FiveStar({ rate = 5 }: { rate: number }) {
  const filledStars = Math.floor(rate);
  const decimalStar = Math.ceil(rate) - rate;
  const emptyStars = 5 - filledStars - (decimalStar > 0 ? 1 : 0);

  return (
    <div className='flex gap-2'>
      {[...Array(filledStars)].map((_, index) => (
        <div key={`filled-star-${index}`}>
          <Star />
        </div>
      ))}
      {decimalStar > 0 && <Star fraction={decimalStar} />}
      {[...Array(emptyStars)].map((_, index) => (
        <div key={`decimal-star${index}`}>
          <Star fraction={emptyStars} />
        </div>
      ))}
    </div>
  );
}

function OneStar({ rate = 5 }: { rate: number }) {
  let decimalStar: number = Math.ceil(rate / 5) - rate / 5;

  return <div className='flex gap-2'>{rate === 5 ? <Star /> : <Star fraction={decimalStar} />}</div>;
}

function Star({ fraction }: StarProps) {
  const gradientId = `star-gradient-${fraction}`;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 26 26'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='w-4 h-4 mbsm:w-6 mbsm:h-6'
    >
      <defs>
        <linearGradient id={gradientId} x1='1' x2='0' y1='0' y2='0'>
          {/* change the color in here */}
          <stop offset={fraction} stopColor='#D7D2CF' />
          <stop offset={fraction} stopColor='#ffb400' />
        </linearGradient>
      </defs>

      <path
        id='star'
        d='M26.153,9.707a1.142,1.142,0,0,1-.409.757l-5.705,5.588,1.352,7.892a2.355,2.355,0,0,1,.016.316.934.934,0,0,1-.165.56.555.555,0,0,1-.48.229,1.265,1.265,0,0,1-.628-.19l-7.057-3.725L6.02,24.86a1.33,1.33,0,0,1-.628.19A.57.57,0,0,1,4.9,24.82a.937.937,0,0,1-.166-.56,2.591,2.591,0,0,1,.031-.316l1.352-7.892L.393,10.465A1.2,1.2,0,0,1,0,9.707q0-.584.88-.726l7.89-1.152L12.307.647q.3-.647.77-.647t.77.647l3.537,7.182,7.89,1.152q.88.142.88.726Z'
        transform='translate(0 0)'
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
