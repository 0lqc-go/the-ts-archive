/* 08 — Editorial threads for the six existing journeys. No additional films,
   invented frames, external lookups, or changes to the editorial ballot. */
(() => {
  'use strict';
  const editorial = {
    obsession: {
      lens:'Ambition & its cost', mood:'Obsession',
      notes:{
        'whiplash-2014':'Discipline becomes a contest between the pursuit of perfection and the person paying for it.',
        'phantom-thread':'Exacting craft enters the private space of a relationship, where attention becomes a form of control.',
        'the-novice':'The need to prove oneself turns routine and physical effort into a consuming ritual.',
        'tar-2022':'Mastery, authority and the fragile distance between an artist and the power of their position.',
        'the-brutalist':'The ambition to build something lasting meets the compromises of the world around the artist.'
      }
    },
    silence:{
      lens:'Presence & absence', mood:'Atmosphere',
      notes:{
        'oslo-august-31st':'The ordinary movement of a city continues around a private sense of separation.',
        'aftersun':'Memory searches small gestures and fragments for feelings that were never fully spoken.',
        'manchester-by-the-sea':'Everyday restraint gives grief its shape without having to explain it.',
        'the-souvenir':'The spaces between looks and conversations become a language for intimacy and doubt.',
        'the-banshees-of-inisherin':'A break in companionship turns familiar landscapes and silences into something strange.'
      }
    },
    'music-memory':{
      lens:'Sound as remembrance', mood:'Music',
      notes:{
        'inside-llewyn-davis':'Music holds a life in its rhythm, even when the world seems to move past its performer.',
        'la-la-land':'Melody imagines the life that might have unfolded differently.',
        'tick-tick-boom-2021':'The rhythm of creation becomes a way to understand the pressure of passing time.',
        'a-complete-unknown':'Songs trace the shifting relationship between a private voice and a public identity.',
        'tar-2022':'A musical gesture can be an expression of memory, authority and vulnerability at once.'
      }
    },
    'unlived-lives':{
      lens:'Memory & possibility', mood:'Intimacy',
      notes:{
        'before-midnight':'Love is no longer a possibility alone, but a history that two people must continually negotiate.',
        'past-lives':'A connection from another time invites an imagined life that never quite becomes the present.',
        'the-worst-person-in-the-world':'The search for a meaningful life opens and closes doors faster than one can understand them.',
        'la-la-land':'A dream and a relationship are remembered through the possibilities they leave behind.',
        'her':'Intimacy can transform a person even when the world it creates cannot remain the same.'
      }
    },
    'other-worlds':{
      lens:'Scale & wonder', mood:'Atmosphere',
      notes:{
        'arrival-2016':'The vast unknown becomes an intimate question about language, time and human connection.',
        interstellar:'Scale gives emotional distance a tangible form; the universe becomes deeply personal.',
        'blade-runner-2049':'Light and monumental space turn questions of identity into a physical atmosphere.',
        'dune-part-two':'The landscape is not a backdrop but part of the conflict between individual and myth.',
        'the-tree-of-life-2011':'Cosmic imagery and the smallest moments of a family life exist on the same emotional scale.'
      }
    },
    'worlds-by-design':{
      lens:'Space, texture & form', mood:'Visuals',
      notes:{
        'anna-karenina-2012':'Theatrical spaces blur the line between a social world and the performance demanded by it.',
        'the-grand-budapest-hotel':'Symmetry, colour and meticulous sets preserve a world as though it were a treasured memory.',
        'asteroid-city':'Constructed spaces make the act of telling a story visible within the story itself.',
        'poor-things-2023':'An expressive world expands in step with curiosity and discovery.',
        'the-brutalist':'Architecture speaks about the tension between an artistic vision and the conditions of its creation.'
      }
    }
  };

  // Rendering can still fall back to the original journey if this module is unavailable.
  function enabled() { return true; }
  function decorate(journey) {
    if (!editorial[journey.id]) return journey;
    const details=editorial[journey.id];
    return {...journey, lens:details.lens, mood:details.mood, entries:journey.entries.map(entry=>({...entry, editorialNote:details.notes[entry.film.slug] || journey.description}))};
  }
  function href(id, slug = '') {
    const query=new URLSearchParams({mode:'journeys'});
    if (id) query.set('journey',id);
    if (slug) query.set('shot',slug);
    return `screening-room.html?${query}`;
  }
  function filmHref(journey, entry) {
    const query=new URLSearchParams({edition:entry.film.editionId,film:entry.film.slug,from:'journey',journey:journey.id,shot:entry.film.slug});
    return `awards.html?${query}`;
  }
  function forMood(label) {
    const value=Object.entries(editorial).find(([,item])=>item.mood.toLowerCase()===String(label).toLowerCase());
    return value?.[0] ?? null;
  }
  function related(archive,key) {
    return archive.journeys.filter(journey=>journey.entries.some(entry=>entry.film.key===key));
  }
  globalThis.ArchiveJourneyEditorial = {enabled,decorate,href,filmHref,forMood,related};
})();
