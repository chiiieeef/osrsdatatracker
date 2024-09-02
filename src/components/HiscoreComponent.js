import React, { useState } from "react";

const HiscoreComponent = () => {
    const [username, setUsername] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // Separate labels for skills, additional entries, and boss kills
    const skillLabels = [
        "Overall", "Attack", "Defence", "Strength", "Hitpoints", "Ranged",
        "Prayer", "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing",
        "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility",
        "Thieving", "Slayer", "Farming", "Runecrafting", "Hunter", "Construction"
    ];

    const additionalLabels = [
        "League Points", "Deadman Points", "Bounty Hunter - Hunter",
        "Bounty Hunter - Rogue", "Bounty Hunter (Legacy) - Hunter", 
        "Bounty Hunter (Legacy) - Rogue", "Clue Scrolls (all)", 
        "Clue Scrolls (beginner)", "Clue Scrolls (easy)", "Clue Scrolls (medium)",
        "Clue Scrolls (hard)", "Clue Scrolls (elite)", "Clue Scrolls (master)",
        "LMS - Rank", "PvP Arena - Rank", "Soul Wars Zeal", "Rifts closed",
        "Colosseum Glory"
    ];

    const bossLabels = [
        "Abyssal Sire", "Alchemical Hydra", "Artio", "Araxxor", "Barrows Chests",
        "Bryophyta", "Callisto", "Cal'varion", "Cerberus", "Chambers of Xeric",
        "Chambers of Xeric: Challenge Mode", "Chaos Elemental", "Chaos Fanatic",
        "Commander Zilyana", "Corporeal Beast", "Crazy Archaeologist",
        "Dagannoth Prime", "Dagannoth Rex", "Dagannoth Supreme",
        "Deranged Archaeologist", "Duke Sucellus", "General Graardor",
        "Giant Mole", "Grotesque Guardians", "Hespori", "Kalphite Queen",
        "King Black Dragon", "Kraken", "Kree'Arra", "K'ril Tsutsaroth",
        "Lunar Chests", "Mimic", "Nex", "Nightmare", "Phosani's Nightmare",
        "Obor", "Phantom Muspah", "Sarachnis", "Scorpia", "Scurrius", "Skotizo",
        "Sol Heredit", "Spindel", "Tempoross", "The Gauntlet", 
        "The Corrupted Gauntlet", "The Leviathan", "The Whisperer",
        "Theatre of Blood", "Theatre of Blood: Hard Mode",
        "Thermonuclear Smoke Devil", "Tombs of Amascut", 
        "Tombs of Amascut: Expert Mode", "TzKal-Zuk", "TzTok-Jad", 
        "Vardorvis", "Venenatis", "Vet'ion", "Vorkath", "Wintertodt",
        "Zalcano", "Zulrah"
    ];

    const fetchHiscoreData = async () => {
        try {
            const url = `/api/hiscore/${encodeURIComponent(username)}`;
            console.log(`Fetching data from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const result = await response.text(); // The hiscore API returns plain text

            // Split the response into lines
            const lines = result.split('\n');

            // Initialize the data structure
            const hiscoreData = {
                username,
                skills: {},
                additional: {},
                bosses: {}
            };

            // Map each line to a corresponding label and store in the appropriate section
            lines.forEach((line, index) => {
                const [rank, level, xp] = line.split(',');

                if (index < skillLabels.length) { // Skills
                    const label = skillLabels[index];
                    hiscoreData.skills[label] = { rank, level, xp };
                } else if (index < skillLabels.length + additionalLabels.length) { // Additional entries
                    const label = additionalLabels[index - skillLabels.length];
                    hiscoreData.additional[label] = { rank, KC: level }; // Use level as KC, ignore xp
                } else { // Boss kills
                    const label = bossLabels[index - skillLabels.length - additionalLabels.length];
                    hiscoreData.bosses[label] = { rank, KC: level }; // Use level as KC, ignore xp
                }
            });

            console.log("Formatted Hiscore Data:", hiscoreData); // Debugging output
            setData(hiscoreData);
            setError(null);
        } catch (err) {
            console.error(`Fetch error: ${err.message}`);
            setError(err.message);
            setData(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchHiscoreData();
    };

    return (
        <div>
            <h1>RuneScape Hiscore Lookup</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <button type="submit">Fetch Hiscore</button>
            </form>

            {error && <p>Error: {error}</p>}
            {data && (
                <div>
                    <h2>Hiscore Data for {username}</h2>
                    <h3>Skills</h3>
                    <ul>
                        {Object.entries(data.skills).map(([skill, details]) => (
                            <li key={skill}>
                                <strong>{skill}</strong>: Rank {details.rank}, Level {details.level}, XP {details.xp}
                            </li>
                        ))}
                    </ul>
                    <h3>Additional Entries</h3>
                    <ul>
                        {Object.entries(data.additional).map(([entry, details]) => (
                            <li key={entry}>
                                <strong>{entry}</strong>: Rank {details.rank}, KC {details.KC}
                            </li>
                        ))}
                    </ul>
                    <h3>Boss Kills</h3>
                    <ul>
                        {Object.entries(data.bosses).map(([boss, details]) => (
                            <li key={boss}>
                                <strong>{boss}</strong>: Rank {details.rank}, KC {details.KC}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default HiscoreComponent;
