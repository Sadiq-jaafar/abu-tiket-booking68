import { PageLayout } from "@/components/page-layout"

export default function AboutPage() {
  return (
    <PageLayout
      title="About Ahmadu Bello University"
      description="Learn about the history and mission of Ahmadu Bello University"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">Our History</h2>
          <p className="text-gray-700">
            Ahmadu Bello University (ABU) is a federal government research university located in Zaria, Kaduna State,
            Nigeria. It was founded on October 4, 1962, as the University of Northern Nigeria. The university is named
            after the Sardauna of Sokoto, Alhaji Sir Ahmadu Bello, the first premier of Northern Nigeria.
          </p>
          <p className="text-gray-700 mt-3">
            The university has grown to become the largest university in Nigeria and one of the largest in Africa, with
            a student population of over 35,000 and a staff strength of about 1,400.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">Our Mission</h2>
          <p className="text-gray-700">
            The mission of Ahmadu Bello University is to advance the frontiers of learning and break new grounds,
            through teaching, research and the dissemination of knowledge of the highest quality; to establish and
            foster national and international integration, development and the promotion of African traditions and
            cultures; to produce high-level human power and enhance capacity-building through retraining, in order to
            meet the needs and challenges of the catchment area, Nigeria and the rest of the world.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">Our Vision</h2>
          <p className="text-gray-700">
            To be a world-class university comparable to any other, engaged in imparting contemporary knowledge, using
            high quality facilities and multi-disciplinary approaches, to men and women of all races, as well as
            generating new ideas and intellectual practices relevant to the needs of its immediate community, Nigeria
            and the world at large.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">Campus Transportation</h2>
          <p className="text-gray-700">
            ABU Tiket is the official transportation booking platform for Ahmadu Bello University. It was established to
            streamline the process of booking campus shuttles and inter-campus transportation services for students,
            staff, and visitors. The platform aims to provide a convenient, efficient, and reliable transportation
            experience for the university community.
          </p>
        </section>
      </div>
    </PageLayout>
  )
}
