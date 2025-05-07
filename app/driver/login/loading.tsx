import { Loader2 } from "lucide-react"

export default function DriverLoginLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h2 className="mt-4 text-xl font-semibold">Loading...</h2>
    </div>
  )
}
