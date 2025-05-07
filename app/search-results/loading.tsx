import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="mb-6">
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>

        <div className="space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="h-40 md:h-auto md:w-1/4" />
                  <CardContent className="flex-1 p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Skeleton className="h-7 w-20" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                  </CardContent>
                  <div className="p-4 md:w-1/6 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </main>
  )
}
