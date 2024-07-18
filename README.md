# gradR

Application for `R` teachers to grade/mark and comment on HTML files generated with [R Markdown](https://rmarkdown.rstudio.com/) and [Quarto](https://quarto.org/)

## Motivation

Back in my days as a teacher of quantitative research methods, statistic, and `R`, me and my colleagues would ask students to prepare assignment reports in R Markdown and submit the rendered HTML document. When it came to grading these assignments, we were all quite dissatisfied with the tools available in this or that virtual learning environment.

I wished for a piece of software that would make it easy to import a grading rubric, apply it to a given assignment, attach comments to the HTML file, and export grades. Though I've moved on in my career since, I still think this would be a valuable tool and so I sat down and wrote `gradR`. I hope you will find it useful...

## Installation

> [!WARNING]
> This software comes with no warranties whatsoever

The simplest way of installing `gradR` is to download the installers for [Windows](), [MacOS](), or [Linux](). However, the beauty of open source software is that you can download the source code by cloning this GitHub repository and build the app yourself.

To do that, you will need to install [Node.js](https://nodejs.org/en) and [yarn](https://classic.yarnpkg.com/en/docs/install). Once you've done that, you can easily install all the dependency packages `gradR` uses by navigating to the directory where you cloned this repo in your shell/terminal of choice and running the command:

```bash
$ yarn
```

When the packages have installed, you can go ahead and build the app for your OS of choice with:

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

This will create a `dist` folder in your directory where you will find the installer file.

## Features

`gradR` is a simple app with a clean interface that allows you to easily

- create grading rubric
- load rubric for a grading project
- read, annotate, and grade HTML documents R markdown and Quarto
- attach rubric criteria to comments
- provide general feedback
- use standard markdown and maths notation to format your comments and feedback
- export grades as CSV

## Demo

[](https://www.youtube.com/watch?v=Cs-UpLl7oaU)

---

> [!NOTE]
> This app is a one-person endeavour. If you find it useful, I'll be grateful if you support me via [ko-fi](https://ko-fi.com/mivalek). Also, please consider asking your institution for a donation if gradR catches on where you work. Thank you! :heart:
