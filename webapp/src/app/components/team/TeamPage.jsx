export default function TeamPage() {

    const members = [
        {
            name: "Lorenz Schmidt",
            role: "Product Owner & Lead Developer"
        },
        {
            name: "Philipp Seytter",
            role: "Scrum Master & Developer"
        },
        {
            name: "Loreine Maly",
            role: "Developer"
        },
        {
            name: "Anne Mieke Vincken",
            role: "Public Relations"
        },
    ]

    return (
        <div className={"h-screen grid grid-cols-2 gap-2 mt-32"}>
            {members.map((member, index) => (
                <div key={index} className={"flex flex-col gap-2 justify-center items-center"}>
                    <span className={"font-swiss font-bold"}>
                        {member.name}
                    </span>
                    <span>
                        {member.role}
                    </span>
                </div>
            ))
            }
        </div>
    );
}
