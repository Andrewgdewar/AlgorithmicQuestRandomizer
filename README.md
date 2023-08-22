
# **Dushaoan's AlgorithmicQuestRandomizer**

=== INSTALL STEPS ===

1. Drag and drop this folder into the user/mods folder.
2. Update your mods/order.json so that this is last on the list.
3. Optionally change your configuration (see below configuration options).

4. ???????

5. Profit!!!!

Example order.json with recommended mods:
{
"order": [
"ServerValueModifier",
"zPOOP",
"Lua-CustomSpawnPoints",
"Dushaoan-XXXX",
"Dushaoan-AlgorithmicQuestRandomizer"
]
}



==== Configuration Options ====
{
    "enable": true,
    
    // This changes how free the algorithm is when choosing items to replace
    // For example with an "easy" difficulty, the randomizer will only replace items that are less rare than the one being targeted, IE salewas > car medkits
    // "masochist" difficulty is the complete opposite, (although it is random) so think "wires" > "graphic cards" (potentially)
    // "random" is exactly that, the algorithm will randomly select any item from the same category.. good luck!
    "difficulty": "medium",

    //These are the valid settings to use with the above "difficulty" setting and are for EXAMPLE only.
    "EXAMPLE_DIFFICULTY_Values_FOR_ABOVE": [
        "easy",
        "medium",
        "hard",
        "masochist",
        "random"
    ],

    //Change this to change the randomizer, share difficulty/seed with friends to get the same outcome!
    "seed": 2023,

    //Will print out the changes for each quest
    "debug": false
}