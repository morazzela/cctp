type Props = {
  className?: string;
};

export default function ShadowBackground({ className }: Props) {
  return (
    <svg
      className={className}
      width="1714"
      height="916"
      viewBox="0 0 1714 916"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M1409 233C1409 537.309 1162.31 784 858 784C553.691 784 307 537.309 307 233C307 -71.3089 553.691 -318 858 -318C1162.31 -318 1409 -71.3089 1409 233ZM318.678 233C318.678 530.859 560.141 772.322 858 772.322C1155.86 772.322 1397.32 530.859 1397.32 233C1397.32 -64.8592 1155.86 -306.322 858 -306.322C560.141 -306.322 318.678 -64.8592 318.678 233Z"
          fill="url(#paint0_linear_2895_6750)"
        />
      </g>
      <g filter="url(#filter0_f_2895_6750)">
        <path
          d="M1409 233C1409 537.309 1162.31 784 858 784C553.691 784 307 537.309 307 233C307 -71.3089 553.691 -318 858 -318C1162.31 -318 1409 -71.3089 1409 233ZM333.629 233C333.629 522.602 568.398 757.371 858 757.371C1147.6 757.371 1382.37 522.602 1382.37 233C1382.37 -56.6023 1147.6 -291.371 858 -291.371C568.398 -291.371 333.629 -56.6023 333.629 233Z"
          fill="url(#paint1_linear_2895_6750)"
        />
      </g>
      <rect width="1714" height="916" fill="url(#paint2_linear_2895_6750)" />
      <defs>
        <filter
          id="filter0_f_2895_6750"
          x="257"
          y="-368"
          width="1202"
          height="1202"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="25"
            result="effect1_foregroundBlur_2895_6750"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2895_6750"
          x1="858"
          y1="-318"
          x2="858"
          y2="722.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0.38506"
            stopColor="var(--color-dark-primary)"
            stopOpacity="0"
          />
          <stop offset="0.885658" stopColor="var(--color-dark-primary)" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2895_6750"
          x1="858"
          y1="-318"
          x2="858"
          y2="784"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-dark-primary)" stopOpacity="0" />
          <stop offset="0.81" stopColor="var(--color-dark-primary)" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2895_6750"
          x1="857"
          y1="-137.62"
          x2="857"
          y2="916"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--color-dark)" />
          <stop offset="1" stopColor="var(--color-dark)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
