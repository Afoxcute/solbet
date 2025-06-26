import React from 'react'

const LoadingIcon = () => {
  return (
    <div className="flex justify-center items-center gap-2 h-24">
      <div className="size-1 bg-green-500 rounded-full animate-bounce"></div>
      <div className="size-1 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
      <div className="size-1 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
    </div>)
}

export default LoadingIcon
