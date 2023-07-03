import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(wholeText: string, searchQuery: string[]): string {
    if (!searchQuery) {
      return wholeText;
    }

    let highlightedText = wholeText;
    for (const character of searchQuery)
    {
      const re = new RegExp(character, 'gi');
      highlightedText = highlightedText.replace(re, '<mark>$&</mark>');
    }
    return highlightedText
  }
}
