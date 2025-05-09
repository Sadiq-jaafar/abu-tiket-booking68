import { PageLayout } from "@/components/page-layout"
import { MapPin } from "lucide-react"

export default function CampusMapPage() {
  return (
    <PageLayout title="Campus Map" description="Navigate Ahmadu Bello University with our interactive campus map">
      <div className="space-y-6">
        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center p-8">
            <MapPin className="h-12 w-12 text-[#006400] mx-auto mb-4" />
            <p className="text-gray-600">Interactive campus map will be available soon.</p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">Main Campus</h2>
          <p className="text-gray-700">
            The Main Campus is located in Samaru, Zaria, and houses most of the university's faculties, administrative
            buildings, and student accommodations. Key landmarks include the Senate Building, Kashim Ibrahim Library,
            and the Assembly Hall.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">Kongo Campus</h2>
          <p className="text-gray-700">
            The Kongo Campus is located in Zaria City and houses the Faculty of Law, Faculty of Administration, and the
            Institute of Administration. It is approximately 5 kilometers from the Main Campus.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">Teaching Hospital</h2>
          <p className="text-gray-700">
            The Ahmadu Bello University Teaching Hospital (ABUTH) is located in Shika, about 10 kilometers from the Main
            Campus. It serves as a teaching facility for the Faculty of Medicine and provides healthcare services to the
            university community and the general public.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">Shuttle Stops</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Main Campus Terminal</h3>
              <p className="text-sm text-gray-600">
                Located near the main gate, this is the central hub for all campus shuttles.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Faculty of Science</h3>
              <p className="text-sm text-gray-600">Shuttle stop serving the Faculty of Science and nearby faculties.</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Student Hostels</h3>
              <p className="text-sm text-gray-600">Multiple stops serving the various student accommodation areas.</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Kongo Campus Terminal</h3>
              <p className="text-sm text-gray-600">The main shuttle stop at Kongo Campus, near the Faculty of Law.</p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
