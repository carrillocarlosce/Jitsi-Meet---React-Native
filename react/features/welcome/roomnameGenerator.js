/* @flow */

import { randomElement } from '../base/util';

/*
const _NOUN_ = [
];
*/

/**
 * The list of plural nouns.
 * @const
 */
const _PLURALNOUN_ = [
    'Patients', 'Doctors', 'People', 'Surgeons', 'Professionals', 'Family'
];

/*
const _PLACE_ = [
    'Pub', 'University', 'Airport', 'Library', 'Mall', 'Theater', 'Stadium',
    'Office', 'Show', 'Gallows', 'Beach', 'Cemetery', 'Hospital', 'Reception',
    'Restaurant', 'Bar', 'Church', 'House', 'School', 'Square', 'Village',
    'Cinema', 'Movies', 'Party', 'Restroom', 'End', 'Jail', 'PostOffice',
    'Station', 'Circus', 'Gates', 'Entrance', 'Bridge'
];
*/

/**
 * The list of verbs.
 * @const
 */
const _VERB_ = [
    'Treated', 'Healed', 'Cared', 'Loved'
];

/**
 * The list of adverbs.
 * @const
 */
const _ADVERB_ = [
    'Absently', 'Accurately', 'Accusingly', 'Adorably', 'AllTheTime', 'Alone',
    'Always', 'Amazingly', 'Angrily', 'Anxiously', 'Anywhere', 'Appallingly',
    'Apparently', 'Articulately', 'Astonishingly', 'Badly', 'Barely',
    'Beautifully', 'Blindly', 'Bravely', 'Brightly', 'Briskly', 'Brutally',
    'Calmly', 'Carefully', 'Casually', 'Cautiously', 'Cleverly', 'Constantly',
    'Correctly', 'Crazily', 'Curiously', 'Cynically', 'Daily', 'Dangerously',
    'Deliberately', 'Delicately', 'Desperately', 'Discreetly', 'Eagerly',
    'Easily', 'Euphoricly', 'Evenly', 'Everywhere', 'Exactly', 'Expectantly',
    'Extensively', 'Ferociously', 'Fiercely', 'Finely', 'Flatly', 'Frequently',
    'Frighteningly', 'Gently', 'Gloriously', 'Grimly', 'Guiltily', 'Happily',
    'Hard', 'Hastily', 'Heroically', 'High', 'Highly', 'Hourly', 'Humbly',
    'Hysterically', 'Immensely', 'Impartially', 'Impolitely', 'Indifferently',
    'Intensely', 'Jealously', 'Jovially', 'Kindly', 'Lazily', 'Lightly',
    'Loudly', 'Lovingly', 'Loyally', 'Magnificently', 'Malevolently', 'Merrily',
    'Mightily', 'Miserably', 'Mysteriously', 'NOT', 'Nervously', 'Nicely',
    'Nowhere', 'Objectively', 'Obnoxiously', 'Obsessively', 'Obviously',
    'Often', 'Painfully', 'Patiently', 'Playfully', 'Politely', 'Poorly',
    'Precisely', 'Promptly', 'Quickly', 'Quietly', 'Randomly', 'Rapidly',
    'Rarely', 'Recklessly', 'Regularly', 'Remorsefully', 'Responsibly',
    'Rudely', 'Ruthlessly', 'Sadly', 'Scornfully', 'Seamlessly', 'Seldom',
    'Selfishly', 'Seriously', 'Shakily', 'Sharply', 'Sideways', 'Silently',
    'Sleepily', 'Slightly', 'Slowly', 'Slyly', 'Smoothly', 'Softly', 'Solemnly',
    'Steadily', 'Sternly', 'Strangely', 'Strongly', 'Stunningly', 'Surely',
    'Tenderly', 'Thoughtfully', 'Tightly', 'Uneasily', 'Vanishingly',
    'Violently', 'Warmly', 'Weakly', 'Wearily', 'Weekly', 'Weirdly', 'Well',
    'Well', 'Wickedly', 'Wildly', 'Wisely', 'Wonderfully', 'Yearly'
];

/**
 * The list of adjectives.
 * @const
 */
const _ADJECTIVE_ = [
    'Abominable', 'Accurate', 'Adorable', 'All', 'Alleged', 'Ancient', 'Angry',
    'Anxious', 'Appalling', 'Apparent', 'Astonishing', 'Attractive', 'Awesome',
    'Baby', 'Bad', 'Beautiful', 'Benign', 'Big', 'Bitter', 'Blind', 'Blue',
    'Bold', 'Brave', 'Bright', 'Brisk', 'Calm', 'Camouflaged', 'Casual',
    'Cautious', 'Choppy', 'Chosen', 'Clever', 'Cold', 'Cool', 'Crawly',
    'Crazy', 'Creepy', 'Cruel', 'Curious', 'Cynical', 'Dangerous', 'Dark',
    'Delicate', 'Desperate', 'Difficult', 'Discreet', 'Disguised', 'Dizzy',
    'Dumb', 'Eager', 'Easy', 'Edgy', 'Electric', 'Elegant', 'Emancipated',
    'Enormous', 'Euphoric', 'Evil', 'Fast', 'Ferocious', 'Fierce', 'Fine',
    'Flawed', 'Flying', 'Foolish', 'Foxy', 'Freezing', 'Funny', 'Furious',
    'Gentle', 'Glorious', 'Golden', 'Good', 'Green', 'Green', 'Guilty',
    'Hairy', 'Happy', 'Hard', 'Hasty', 'Hazy', 'Heroic', 'Hostile', 'Hot',
    'Humble', 'Humongous', 'Humorous', 'Hysterical', 'Idealistic', 'Ignorant',
    'Immense', 'Impartial', 'Impolite', 'Indifferent', 'Infuriated',
    'Insightful', 'Intense', 'Interesting', 'Intimidated', 'Intriguing',
    'Jealous', 'Jolly', 'Jovial', 'Jumpy', 'Kind', 'Laughing', 'Lazy', 'Liquid',
    'Lonely', 'Longing', 'Loud', 'Loving', 'Loyal', 'Macabre', 'Mad', 'Magical',
    'Magnificent', 'Malevolent', 'Medieval', 'Memorable', 'Mere', 'Merry',
    'Mighty', 'Mischievous', 'Miserable', 'Modified', 'Moody', 'Most',
    'Mysterious', 'Mystical', 'Needy', 'Nervous', 'Nice', 'Objective',
    'Obnoxious', 'Obsessive', 'Obvious', 'Opinionated', 'Orange', 'Painful',
    'Passionate', 'Perfect', 'Pink', 'Playful', 'Poisonous', 'Polite', 'Poor',
    'Popular', 'Powerful', 'Precise', 'Preserved', 'Pretty', 'Purple', 'Quick',
    'Quiet', 'Random', 'Rapid', 'Rare', 'Real', 'Reassuring', 'Reckless', 'Red',
    'Regular', 'Remorseful', 'Responsible', 'Rich', 'Rude', 'Ruthless', 'Sad',
    'Scared', 'Scary', 'Scornful', 'Screaming', 'Selfish', 'Serious', 'Shady',
    'Shaky', 'Sharp', 'Shiny', 'Shy', 'Simple', 'Sleepy', 'Slow', 'Sly',
    'Small', 'Smart', 'Smelly', 'Smiling', 'Smooth', 'Smug', 'Sober', 'Soft',
    'Solemn', 'Square', 'Square', 'Steady', 'Strange', 'Strong', 'Stunning',
    'Subjective', 'Successful', 'Surly', 'Sweet', 'Tactful', 'Tense',
    'Thoughtful', 'Tight', 'Tiny', 'Tolerant', 'Uneasy', 'Unique', 'Unseen',
    'Warm', 'Weak', 'Weird', 'WellCooked', 'Wild', 'Wise', 'Witty', 'Wonderful',
    'Worried', 'Yellow', 'Young', 'Zealous'
];

/*
const _PRONOUN_ = [
];
*/

/*
const _CONJUNCTION_ = [
    'And', 'Or', 'For', 'Above', 'Before', 'Against', 'Between'
];
*/

/**
 * Maps a string (category name) to the array of words from that category.
 * @const
 */
const CATEGORIES: { [key: string]: Array<string> } = {
    _ADJECTIVE_,
    _ADVERB_,
    _PLURALNOUN_,
    _VERB_

//    _CONJUNCTION_,
//    _NOUN_,
//    _PLACE_,
//    _PRONOUN_,
};

/**
 * The list of room name patterns.
 * @const
 */
const PATTERNS = [
    '_ADJECTIVE__PLURALNOUN__VERB__ADVERB_'

    // BeautifulFungiOrSpaghetti
//    '_ADJECTIVE__PLURALNOUN__CONJUNCTION__PLURALNOUN_',

    // AmazinglyScaryToy
//    '_ADVERB__ADJECTIVE__NOUN_',

    // NeitherTrashNorRifle
//    'Neither_NOUN_Nor_NOUN_',
//    'Either_NOUN_Or_NOUN_',

    // EitherCopulateOrInvestigate
//    'Either_VERB_Or_VERB_',
//    'Neither_VERB_Nor_VERB_',

//    'The_ADJECTIVE__ADJECTIVE__NOUN_',
//    'The_ADVERB__ADJECTIVE__NOUN_',
//    'The_ADVERB__ADJECTIVE__NOUN_s',
//    'The_ADVERB__ADJECTIVE__PLURALNOUN__VERB_',

    // WolvesComputeBadly
//    '_PLURALNOUN__VERB__ADVERB_',

    // UniteFacilitateAndMerge
//    '_VERB__VERB_And_VERB_',

    // NastyWitchesAtThePub
//    '_ADJECTIVE__PLURALNOUN_AtThe_PLACE_',
];

/**
 * Generates a new room name.
 *
 * @returns {string} A newly-generated room name.
 */
export function generateRoomWithoutSeparator() {
    // XXX Note that if more than one pattern is available, the choice of 'name'
    // won't have a uniform distribution amongst all patterns (names from
    // patterns with fewer options will have higher probability of being chosen
    // that names from patterns with more options).
    let name = randomElement(PATTERNS);

    while (_hasTemplate(name)) {
        for (const template in CATEGORIES) { // eslint-disable-line guard-for-in
            const word = randomElement(CATEGORIES[template]);

            name = name.replace(template, word);
        }
    }

    return name;
}

/**
 * Determines whether a specific string contains at least one of the
 * templates/categories.
 *
 * @param {string} s - String containing categories.
 * @private
 * @returns {boolean} True if the specified string contains at least one of the
 * templates/categories; otherwise, false.
 */
function _hasTemplate(s) {
    for (const template in CATEGORIES) {
        if (s.indexOf(template) >= 0) {
            return true;
        }
    }

    return false;
}
