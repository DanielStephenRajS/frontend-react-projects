import type { UniversalProps, PeopleData } from "../Types/Types";
import { useQuery } from "@tanstack/react-query";

const People = ({ handleContentClick, content }: UniversalProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["people"],
    queryFn: PeopleFetch,
  });

  return (
    <div className="content-section">
      <button onClick={() => handleContentClick("people")}>People</button>
      {content === "people" && (
        <div>
          {isLoading && <p>Loading...</p>}
          {data?.results.map((person: PeopleData) => (
            <div key={person.name}>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Name </th>
                    <th>Gender</th>
                    <th>Height</th>
                    <th>Hair Color</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{person.name}</td>
                    <td>{person.gender}</td>
                    <td>{person.height}</td>
                    <td>{person.hair_color}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PeopleFetch = async () => {
  const response = await fetch("https://swapi.dev/api/people/");
  return await response.json();
};

export default People;
