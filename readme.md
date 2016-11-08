# name-search

Search a directory for files that match a regex and copies them to a directory called "results". Supports recursion for subdirectories.

```
nsearch [-qdfr] "directory/to/search" "some|(regex)"

-q: Quiet mode, don't output anything
-v: Verbose, log lots of things
-d: Dry run, don't save to a directory (Can be used to count the amount of matches)
-f: Silence errors
-r: Recursive Search, search subdirectories of the directory
--version: View current version
```

## Installation

`npm i -g name-search`
or
`npm install --global name-search`

Depends on your laziness

## Usage

`nsearch . tree`

Search the current directory for file names containing "tree". Places results in "./results".

`nsearch -rd . apple`

Seach the current directory and all subdirectories for file names containing "apple". Don't place results in "./results".

`nsearch -r ./trees maple|apple`

Search "./trees" and it's subdirectories for filenames matching "maple" or "apple". Place results in "./results".

## Notes

`name-search` will delete the "./results" directory if it exists, so be careful.

Also I wrote most of this at 1 am and wrote the recurion and options part while tired so be careful with this.
