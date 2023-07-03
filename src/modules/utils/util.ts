import { Injectable } from '@angular/core';

@Injectable()
export class UtilService
{
  /**
   * Shuffle the provided array using Fisher–Yates algorithm
   * @param array The array to shuffle
   * @returns The shuffled array
   */
    shuffle<Type>(array: Array<Type>) : Array<Type>
    {
      let currentIndex = array.length,  randomIndex;
    
      // While there remain elements to shuffle.
      while (currentIndex != 0) {
    
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }
    
      return array;
    }

    /**
     * Sanitize a character from pleco database
     * @param character The pleco database character
     * @returns the sanitized character
     */
    sanitizedPlecoCharacter(character: string)
    {
      return character.replaceAll('@', '');
    }
}