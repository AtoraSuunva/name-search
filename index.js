#!/usr/bin/env node
//This entire thing can probably more elegant but meh
if (process.argv.length === 4) {
	var flags = '';
	var folderToSearch = process.argv[2];
	var regex = process.argv[3];
} else if (process.argv.length === 5) {
	var flags = process.argv[2].toLowerCase();
	var folderToSearch = process.argv[3];
	var regex = process.argv[4];
}else{
	console.log('search [-qdfr] "directory/to/search" "some|(regex)"');
	console.log('-q: Quiet mode, don\'t output anything');
	console.log('-d: Dry run, don\'t save to a directory (Can be used to count the amount of matches)');
	console.log('-f: Silence errors');
	console.log('-r: Recursive Search, search subdirectories of the directory');
	process.exit(0); 
}

const fs   = require('fs');
const path = require('path');
const resultsFolder = path.join('.', 'results');

if (!flags.includes('d')) {
	if (fs.existsSync(resultsFolder)) {
		var oldFiles = fs.readdirSync(resultsFolder);
		for(file of oldFiles) {
			try {
				fs.unlinkSync(path.join('.', 'results', file));
			} catch (e) {if (!flags.includes('f')) console.log(e)}
		}
		fs.rmdirSync(resultsFolder);
	}
	fs.mkdirSync(resultsFolder);
}
try {
	if (!flags.includes('r')) {
		var files = fs.readdirSync(folderToSearch);
	} else {
		var files = walkSync(folderToSearch); //Recursive search, search subdirectories of the folder
	}
} catch (e) {
	if (!flags.includes('f')) console.log('No folder found!');
	process.exit(0);
}

var results = 0;
var filesSearched = 0;
for (file of files) {
	try {
		file = file.split('/'); //Split it to get the seperate directories
		var fileName = file.pop(); //grab the file name 
		if (fileName.search(regex) !== -1) {
			results++;
			if (!flags.includes('d')) {
				fs.linkSync(path.join('.', ...file, fileName), path.join(resultsFolder, fileName));
				//holy shit spread syntax in the wild!
			}
		}
	} catch (e) {console.log(e)/*if (!flags.includes('f')) process.stdout.write(`Couldn\'t link file/directory "${file}"`)*/}
	filesSearched++;
	process.stdout.cursorTo(0);
	process.stdout.write(loadingBar(filesSearched, files.length, process.stdout.columns - 8));
	process.stdout.cursorTo(0);
}
process.stdout.clearLine();
if (!flags.includes('q')) console.log(`Found ${results} result${results !== 1 ? 's' : ''}`);

if (results === 0 && !flags.includes('d')) fs.rmdirSync(resultsFolder);

function walkSync(dir, filelist) {
  var path = path || require('path');
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

function loadingBar(current, max, width) {
	var currentPercent = current/ max;
	var filled = '#'.repeat(Math.floor(currentPercent * width));
	var empty  = ' '.repeat(width - Math.floor(currentPercent * width));
	
	return '[' + filled + empty + ']' + ' ' + Math.floor(currentPercent*1000)/10 + '%';
}