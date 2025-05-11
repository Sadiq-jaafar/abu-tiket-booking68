import { PageLayout } from "@/components/page-layout"

export default function FacultiesPage() {
  return (
    <PageLayout
      title="Faculties and Departments"
      description="Explore the academic faculties and departments at Ahmadu Bello University"
    >
      <div className="space-y-6">
        <p className="text-gray-700 mb-6">
          Ahmadu Bello University offers a wide range of academic programs across various faculties and departments.
          Below is a list of the major faculties and some of their departments.
        </p>

        {faculties.map((faculty, index) => (
          <section key={index} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
            <h2 className="text-xl font-semibold text-[#006400] mb-3">{faculty.name}</h2>
            <p className="text-gray-700 mb-3">{faculty.description}</p>

            <h3 className="font-medium mb-2">Departments:</h3>
            <ul className="grid md:grid-cols-2 gap-2">
              {faculty.departments.map((dept, i) => (
                <li key={i} className="text-gray-700 pl-4 border-l-2 border-[#006400]">
                  {dept}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}

const faculties = [
  {
    name: "Faculty of Science",
    description:
      "The Faculty of Science is dedicated to advancing scientific knowledge through research and teaching in various scientific disciplines.",
    departments: [
      "Department of Mathematics",
      "Department of Physics",
      "Department of Chemistry",
      "Department of Biological Sciences",
      "Department of Computer Science",
      "Department of Geology",
    ],
  },
  {
    name: "Faculty of Engineering",
    description:
      "The Faculty of Engineering offers programs that prepare students for careers in various engineering fields, with a focus on practical applications and innovation.",
    departments: [
      "Department of Civil Engineering",
      "Department of Electrical Engineering",
      "Department of Mechanical Engineering",
      "Department of Chemical Engineering",
      "Department of Water Resources Engineering",
      "Department of Agricultural Engineering",
    ],
  },
  {
    name: "Faculty of Medicine",
    description:
      "The Faculty of Medicine is committed to training healthcare professionals and conducting research to improve healthcare delivery in Nigeria and beyond.",
    departments: [
      "Department of Anatomy",
      "Department of Physiology",
      "Department of Biochemistry",
      "Department of Pharmacology",
      "Department of Community Medicine",
      "Department of Surgery",
    ],
  },
  {
    name: "Faculty of Law",
    description:
      "The Faculty of Law provides comprehensive legal education, preparing students for careers in legal practice, judiciary, and academia.",
    departments: [
      "Department of Public Law",
      "Department of Private Law",
      "Department of Commercial Law",
      "Department of Islamic Law",
      "Department of International Law",
    ],
  },
  {
    name: "Faculty of Social Sciences",
    description:
      "The Faculty of Social Sciences offers programs that examine human behavior, societies, and social institutions.",
    departments: [
      "Department of Economics",
      "Department of Political Science",
      "Department of Sociology",
      "Department of Mass Communication",
      "Department of Geography",
      "Department of Psychology",
    ],
  },
]
