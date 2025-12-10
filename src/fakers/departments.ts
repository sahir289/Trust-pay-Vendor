import _ from "lodash";
import countries, { type Country } from "./countries";

export interface Department {
  id: number;
  name: string;
  location: Country;
  head: string;
  employees: number;
  budget: string;
}

const fakers = {
  fakeDepartments() {
    const departments: Array<Department> = [
      {
        id: 1,
        name: "Sales",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "John Doe",
        employees: 35,
        budget: "$2,500,000",
      },
      {
        id: 2,
        name: "Marketing",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "Jane Smith",
        employees: 42,
        budget: "$1,800,000",
      },
      {
        id: 3,
        name: "Customer Support",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "David Johnson",
        employees: 28,
        budget: "$1,200,000",
      },
      {
        id: 4,
        name: "Finance",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "Sarah Williams",
        employees: 19,
        budget: "$3,000,000",
      },
      {
        id: 5,
        name: "Human Resources",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "Michael Brown",
        employees: 14,
        budget: "$900,000",
      },
      {
        id: 6,
        name: "Engineering",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "Emily Davis",
        employees: 56,
        budget: "$4,500,000",
      },
      {
        id: 7,
        name: "Product Management",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "Daniel Lee",
        employees: 23,
        budget: "$2,200,000",
      },
      {
        id: 8,
        name: "Operations",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "Olivia Wilson",
        employees: 31,
        budget: "$1,600,000",
      },
      {
        id: 9,
        name: "Research and Development",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "Matthew Taylor",
        employees: 47,
        budget: "$3,800,000",
      },
      {
        id: 10,
        name: "Quality Assurance",
        location: countries.fakeCountries()[0] || { name: "Unknown", image: "default.png" },
        head: "Sophia Anderson",
        employees: 25,
        budget: "$1,300,000",
      },
    ];

    return _.shuffle(departments);
  },
};

export default fakers;
