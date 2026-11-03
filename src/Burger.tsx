export default function Burger({ small = false }: { small?: boolean }) {
  return <svg viewBox="0 0 380 310" fill="none" aria-hidden="true" className={small ? 'burger burger-small' : 'burger'}>
    <ellipse cx="190" cy="282" rx="137" ry="12" fill="#29251f" opacity=".08" />
    <path d="M63 244h254c-3 31-28 43-62 43H125c-34 0-59-12-62-43Z" fill="#D78B31" stroke="#653C22" strokeWidth="3" />
    <path d="M64 242c27-10 61 8 87 0s46 7 71 0 62 8 94 0" stroke="#F4C75B" strokeWidth="9" />
    <rect x="58" y="215" width="265" height="30" rx="15" fill="#69402B" stroke="#4C3021" strokeWidth="3" />
    <path d="m67 210 69-5 43 24 43-24 91 7-18-23H82Z" fill="#F2C744" stroke="#C79B29" strokeWidth="2" />
    <path d="M66 181h249v21H66z" fill="#E4A147" stroke="#653C22" strokeWidth="3" />
    <path d="M58 172c12-18 24 9 39-4s18 4 34-1 15 12 33 2 22 7 39 0 20 9 39-1 23 7 36-1 31-2 43 9" stroke="#6B8A3C" strokeWidth="15" strokeLinecap="round" />
    <rect x="59" y="139" width="264" height="26" rx="13" fill="#71452D" stroke="#4C3021" strokeWidth="3" />
    <path d="m67 136 65-7 40 26 49-24 88 8-20-23H83Z" fill="#F2C744" stroke="#C79B29" strokeWidth="2" />
    <path d="M63 120C64 58 113 26 190 26s126 32 127 94H63Z" fill="#E6A442" stroke="#653C22" strokeWidth="3" />
    <path d="M78 100c12-42 50-59 107-59" stroke="#F6C568" strokeWidth="6" strokeLinecap="round" />
    {[[122,65],[160,49],[200,67],[240,53],[269,82],[151,95],[220,98],[101,89],[279,104]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="6" ry="2.5" transform={`rotate(${i%2?30:-30} ${x} ${y})`} fill="#FFF0C2" />)}
  </svg>;
}
