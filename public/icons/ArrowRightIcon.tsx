import React from 'react'

const ArrowRightIcon = ({ isInBackground = false }: { isInBackground?: boolean }) => {
  return (
    <svg width="28" height="19" viewBox="0 0 28 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 9.25391H28" stroke={isInBackground ? "#000" : "#ECF5F5"} strokeWidth="2" />
      <path d="M10.2539 1L2 9.25397L10.2539 17.5079" stroke={isInBackground ? "#000" : "#ECF5F5"} strokeWidth="2" />
    </svg>
  )
}

export default ArrowRightIcon
