import Nav from "@/components/Nav"
import LoadingIcon from "@/public/icons/LoadingIcon"

const Loading = () => {
  return (
    <>
      <Nav />
      <div className="flex justify-center py-4">
        <LoadingIcon />
      </div>
    </>
  )
}

export default Loading
