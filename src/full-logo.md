<svg
  width="420"
  height="160"
  viewBox="0 0 420 160"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <mask id="pin-cutout">
      <rect width="100%" height="100%" fill="white" />
      <circle cx="60" cy="60" r="18" fill="black" />
    </mask>
  </defs>

  <!-- Icon (scaled down further) -->
  <g transform="translate(0, 14) scale(0.72)">
    <path
      d="M60 10
         C30 10 15 35 15 60
         C15 95 60 150 60 150
         Z"
      fill="#df2021"
      mask="url(#pin-cutout)"
      transform="translate(-1, 0)"
    />

    <path
      d="M60 10
         C90 10 105 35 105 60
         C105 95 60 150 60 150
         Z"
      fill="#df2021"
      mask="url(#pin-cutout)"
      transform="translate(1, 0)"
    />
  </g>

  <!-- Text block (moved closer) -->
  <g
    transform="translate(98, 72)"
    font-family="Inter Tight, Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fill="#000000"
    text-anchor="start"
  >
    <text
      y="0"
      font-size="42"
      font-weight="700"
      letter-spacing="-0.045em"
    >
      Lookout
    </text>

    <text
      y="36"
      font-size="34"
      font-weight="700"
      letter-spacing="-0.04em"
    >
      Scout
    </text>
  </g>
</svg>
