import type { PlanetData, UniversalProps } from "../Types/Types";
import { useQuery } from "@tanstack/react-query";

const Planet = ({ handleContentClick, content }: UniversalProps) => {

const { data, isLoading } = useQuery({
    queryKey: ["planet"],
    queryFn: PlanetFetch
})


    return (
        <div className="content-section">
            <button onClick={() => handleContentClick("planet")}>
                Planet
            </button>
            {content === "planet" && 
            <div>
                {isLoading && <p>Loading...</p>}
                {data?.results.map((planet : PlanetData) => (
                    <div key={planet.name}>
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Gravity</th>
                                    <th>Climate</th>
                                    <th>Diameter</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{planet.name}</td>
                                    <td>{planet.gravity}</td>
                                    <td>{planet.climate}</td>
                                    <td>{planet.diameter}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
            }
        </div>
    )
}

const PlanetFetch = async () =>{
    const response = await fetch("https://swapi.dev/api/planets/");
    return await response.json();
}

export default Planet;