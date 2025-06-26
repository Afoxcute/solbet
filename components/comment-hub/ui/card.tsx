import { Game, games } from '@/data'
import Image from 'next/image'
import React from 'react'

const Card = ({ game }: { game: Game }) => {
  const alreadyAHub = games.find((g) => g === game)
  return (
    <div>
      {alreadyAHub && <p className=' font-semibold text-[0.9rem] mb-[10px]'>⚠️ This Hub already exists.</p>}
      <div className='p-3 text-black border border-[#BEBEBE]/50 bg-white rounded-[12px]'>

        <h2 className='text-[1rem] font-semibold text-center'>UEFA Champions League</h2>
        <div className='flex justify-between items-center p-4 lg:p-6'>
          <div className='flex flex-col items-center'>
            <Image
              src={game.homeImage}
              alt={game.homeTeam}
              width={100}
              height={100}
              className='w-[50px] lg:w-[150px]'
            />
            <p className='text-center text-[0.9rem] lg:text-[1rem] '>{game.homeTeam}</p>
          </div>

          {alreadyAHub !== undefined ? (
            <div className='flex justify-between items-center gap-1 font-bold'>
              <p className='text-[#FF0000] text-[1.5rem] lg:text-[2rem]'>{game.homeScore}</p>
              <span className='text-[1.5rem] lg:text-[2rem]'>:</span>
              <p className='text-[#FF0000] text-[1.5rem] lg:text-[2rem]'>{game.awayScore}</p>
            </div>
          ) : (
            <div className=' text-[1rem] lg:text-[1.1rem]'>20:00</div>
          )}

          <div className='flex flex-col items-center'>
            <Image
              src={game.awayImage}
              alt={game.awayTeam}
              width={100}
              height={100}
              className='w-[50px] lg:w-[150px]'
            />
            <p className='text-center text-[0.9rem] lg:text-[1rem] font-dmSans'>{game.awayTeam}</p>
          </div>
        </div>

        <div className='flex justify-between items-center'>
          <button className='w-fit bg-darkGreen py-1 px-6 text-white font-extrabold rounded-l'>
            {alreadyAHub ? 'Join Hub' : 'Launch Hub'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Card
