# gradR

Application for `R` teachers to grade/mark and comment on HTML files generated with [R Markdown](https://rmarkdown.rstudio.com/) and [Quarto](https://quarto.org/)

## Motivation

Back in my days as a teacher of quantitative research methods, statistic, and `R`, me and my colleagues would ask students to prepare assignment reports in R Markdown and submit the rendered HTML document. When it came to grading these assignments, we were all quite dissatisfied with the tools available in this or that virtual learning environment.

I wished for a piece of software that would make it easy to import a grading rubric, apply it to a given assignment, attach comments to the HTML file, and export grades. Though I've moved on in my career since, I still think this would be a valuable tool and so I sat down and wrote `gradR`. I hope you will find it useful...

## Installation

> [!WARNING]
> This software comes with no warranties whatsoever

Even if you don't have much experience with using open source software, the setup is not too involved.

1. Before you can run `gradR`, you need to build the app from the source code in this repository. For that, you will need [Node.js](https://nodejs.org/en) and a package manager, such as [yarn](https://classic.yarnpkg.com/en/docs/install).

2. Once you've installed the above, clone/download this repo.

3. Now, you can easily install all the dependency packages `gradR` uses by navigating to the directory where you cloned this repo in your shell/terminal of choice and running the command:

   ```bash
   $ yarn
   ```

4. When the packages have installed, you can go ahead and build the app for your OS of choice with:

   ```bash
   # For windows
   $ yarn build:win

   # For macOS
   $ yarn build:mac

   # For Linux
   $ yarn build:linux
   ```

5. This will create a `dist` folder in your directory where you will find the installer file.

If you really want to avoid building the app yourself, you can download the installer file for:

- [Windows](https://github.com/mivalek/gradR_installers/raw/main/win/gradr%20Setup%201.0.0.exe)
- more to come...

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

Here is a little video demonstration of what you can do in `gradR` (links to YouTube).

[![gradR demo](https://mival.netlify.app/img/gradR_demo_pic.png)](https://www.youtube.com/watch?v=Cs-UpLl7oaU)

---

> [!NOTE]
> This app is a one-person endeavour. If you find it useful, I'll be grateful if you support me via [ko-fi](https://ko-fi.com/mivalek). Also, please consider asking your institution for a donation if gradR catches on where you work. Thank you! :heart:
