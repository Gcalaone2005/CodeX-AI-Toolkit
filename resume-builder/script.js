function generateResume() {
    document.getElementById("resume").style.display = "block";

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let skills = document.getElementById("skills").value.split(",");

    document.getElementById("r_name").innerText = name;
    document.getElementById("r_email").innerText = email;

    let skillList = document.getElementById("r_skills");
    skillList.innerHTML = "";
    skills.forEach(skill => {
        let li = document.createElement("li");
        li.innerText = skill.trim();
        skillList.appendChild(li);
    });

    html2pdf().from(document.getElementById("resume")).save(`${name}_Resume.pdf`);
}