
import { Badge, UserStats } from '../types';

export const DID_YOU_KNOW_FACTS = [
    "The first computer bug was a literal moth found in the Harvard Mark II in 1947.",
    "Python is named after 'Monty Python's Flying Circus', not the snake.",
    "The average person blinks 15-20 times per minute, but only 7 times while looking at a screen.",
    "NASA's entire Apollo 11 guidance computer had less power than a modern smartphone.",
    "The first 1GB hard drive, announced in 1980, weighed over 500 pounds and cost $40,000.",
    "Linux is named after its creator Linus Torvalds, not the other way around.",
    "The '@' symbol in email addresses was chosen by Ray Tomlinson in 1971 because it was unlikely to appear in anyone's name.",
    "The HTTP error code 418 'I'm a teapot' was created as an April Fools' joke in 1998.",
    "The term 'bug' predates computers - Thomas Edison used it to describe technical defects in 1878.",
    "Git was created by Linus Torvalds in just 2 weeks when BitKeeper revoked Linux kernel's free license.",
    "The first computer virus was created in 1983 as an experiment to show vulnerabilities.",
    "JavaScript was created in just 10 days by Brendan Eich at Netscape in 1995.",
    "The word 'spam' for junk email comes from a Monty Python sketch about canned meat.",
    "CAPTCHA stands for 'Completely Automated Public Turing test to tell Computers and Humans Apart'.",
    "The first domain name ever registered was symbolics.com on March 15, 1985.",
    "Over 90% of the world's currency exists only as digital data on computer servers.",
    "The average lifespan of a URL is only about 2 years before it goes dead.",
    "Cookie data is named after 'fortune cookies' - small pieces of data that reveal information.",
    "The term 'cloud computing' was inspired by the cloud symbol used to represent the internet in diagrams.",
    "PostgreSQL was originally called POSTGRES, which stood for 'POST inGRES' (after the INGRES database)."
];

export const AVAILABLE_BADGES: Badge[] = [
    { id: 'b_novice', name: 'Hello World', description: 'Read your first Bit.', icon: 'code', color: 'emerald', condition: (s) => s.bitsRead >= 1 },
    { id: 'b_scholar', name: 'Scholar', description: 'Read 10 Bits.', icon: 'brain', color: 'blue', condition: (s) => s.bitsRead >= 10 },
    { id: 'b_streak_3', name: 'On Fire', description: 'Maintain a 3-day streak.', icon: 'fire', color: 'orange', condition: (s) => s.streak >= 3 },
    { id: 'b_quiz_1', name: 'Sharp Mind', description: 'Win 1 Quiz Challenge.', icon: 'medal', color: 'purple', condition: (s) => s.quizzesWon >= 1 },
    { id: 'b_level_5', name: 'Neural Master', description: 'Reach Level 5.', icon: 'zap', color: 'amber', condition: (_, l) => l >= 5 },
];

export const INITIAL_STATS: UserStats = {
    bitsRead: 0,
    quizzesWon: 0,
    streak: 1,
    lastLogin: Date.now(),
    badges: [],
    bookmarkedBits: [],
    completedBits: [],
    lastSeenBitId: undefined,
    trackProgress: [],
    continueLearning: {
        reason: 'streak-goal'
    }
};
