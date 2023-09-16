#

The "Flutter Fuse" extension is a Visual Studio Code extension for working with Flutter projects.

If you have been working with Flutter for a while, you know that sometimes it can get very boring and repetitive to fix imports of the .dart files, specially if you are using the "Quick Fix" option manually.

Of course there are multiple extensions available and the VS Code's `Fix All` and `Organize Imports` didn't work for me so I thought why not create a silly extension for that; and I did that.

## Why this extension?

- Recently I hopped into an old Flutter project where I wanted to refactor some code. There were a lot of dart files and when I moved them into different folders, the imports didn't update as I expected, for some reason. I wasted a lot of time manually "Quick Fix" ing them. Also, I could't find an extension which already does that. So, meet Flutter Fuse.

Any by the way, this is my very first Flutter extension! So I'm happy that I got it published on VS Code Marketplace! 😊

## Features

- Fix imports in the current .dart file
  This extension will automatically import the relevant files required for the current .dart file. Also after importing, it'll run the `Fix All` option to try to fix if duplicate imports are there. (Like cupertino and material). But this is not fully tested.

## Demo

![App Demo](https://im2.ezgif.com/tmp/ezgif-2-03aaa15e5e.gif)

## Known Issues

- Deprecated package imports are not handled.

## Roadmap

- Give an option to fix imports in whole project instead of just the currently opened .dart file

## License

[MIT](https://choosealicense.com/licenses/mit/)

## 🚀 About Me

I'm RukshanJS and still learning this stuff. Have experience with Flutter for 2.5+ years. (Mostly worked with Flutter 2 though)

You can connect with me on LinkedIn, I'd be happy to get in touch!

Have a nice day 😃
