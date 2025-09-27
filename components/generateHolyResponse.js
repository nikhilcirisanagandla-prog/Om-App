import scriptures from '../data/scriptures.json';

export const generateHolyResponse = (userQuery) => {
  const queryLower = userQuery.toLowerCase();
  let topic = 'wisdom';
  let god = null;
  let source = 'Hindu Scriptures';

  if (queryLower.includes('krishna') || queryLower.includes('gita') || queryLower.includes('duty') || 
      queryLower.includes('karma') || queryLower.includes('action')) {
    topic = 'duty';
    god = 'Lord Krishna';
    source = 'Bhagavad Gita';
  } else if (queryLower.includes('rama') || queryLower.includes('ramayanam') || queryLower.includes('ramayana') || 
             queryLower.includes('valor') || queryLower.includes('dharma') || queryLower.includes('sita')) {
    topic = 'valor';
    god = 'Lord Rama';
    source = 'Ramayanam';
  } else if (queryLower.includes('shiva') || queryLower.includes('destroyer') || queryLower.includes('transformation')) {
    topic = 'transformation';
    god = 'Lord Shiva';
    source = 'Vedas';
  } else if (queryLower.includes('veda') || queryLower.includes('ritual') || queryLower.includes('sacrifice') || 
             queryLower.includes('yajna') || queryLower.includes('mantra')) {
    topic = 'rituals';
    god = 'Vedic Sages';
    source = 'Vedas';
  } else if (queryLower.includes('vishnu') || queryLower.includes('preserver') || queryLower.includes('protection')) {
    topic = 'protection';
    god = 'Lord Vishnu';
    source = 'Puranas';
  } else if (queryLower.includes('peace') || queryLower.includes('meditation') || queryLower.includes('yoga')) {
    topic = 'peace';
    god = 'Divine Consciousness';
    source = 'Upanishads';
  }

  const options = scriptures.topics[topic] || scriptures.topics.wisdom;
  const selected = options[Math.floor(Math.random() * options.length)];
  
  const finalGod = god || selected.god;
  const finalSource = source || selected.source;

  return {
    text: `${finalGod ? `${finalGod} says: ` : ''}"${selected.text}"\n\n${selected.reflection}`,
    god: finalGod,
    source: finalSource,
  };
};