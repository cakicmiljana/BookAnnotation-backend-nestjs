# Seed texts

Excerpts of public-domain books from Project Gutenberg, used only by `npm run seed`.

| File | Source | Excerpt |
| --- | --- | --- |
| `the-great-gatsby.txt` | F. Scott Fitzgerald, *The Great Gatsby* (1925), Gutenberg eBook #64317 | Chapters I–II |
| `crime-and-punishment.txt` | Fyodor Dostoevsky, *Crime and Punishment*, translated by Constance Garnett, Gutenberg eBook #2554 | Part I, chapters I–II |
| `the-picture-of-dorian-gray.txt` | Oscar Wilde, *The Picture of Dorian Gray* (1891), Gutenberg eBook #174 | Preface, chapters I–II |

Preparation: the text between Gutenberg's `*** START` / `*** END` markers was cut at
chapter boundaries, hard-wrapped lines were joined into one line per paragraph
(paragraphs are separated by a blank line), and `_italic_` markers were removed.

Do not edit these files after seeding: stored editions are immutable, and
annotation offsets point into their text.
