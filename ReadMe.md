# Marta Mobility ETA (Website component)

A clear, mobile-friendly, view of upcoming trips and ETAs for MARTA Mobility customers. Design to be a lightweight addition to any other web page.

## Getting Started
Clone the repo, run a server that supports PHP, and load up MARTA.html. The two dependencies (Promise Polyfill and Simple HTML DOM) are included in this folder, so for now there is no installation or set up step.

## Built With

* [Vanilla JS](http://vanilla-js.com/) - to avoid adding more than necessary to MARTA's site, no framework/library is used for templating the content. It is just concatenated strings.
* [Promise Polyfill](https://github.com/taylorhakes/promise-polyfill)
* [Simple HTML DOM](https://github.com/sunra/php-simple-html-dom-parser) - For scraping trip data from MARTA's old site.

## License

We are still working out the details, but anything in this repo that is not specifically MARTA's work is intended to be Free Open Source Software and could be reused by any similar paratransit organization wishing to connect it to their data and website. 

## Acknowledgments

Much of this particular implementation was written by Mark Noonan, but it draws on converstations, research, code, and other contributions from many others, without whom it would be very different (or indeed, wouldn't exist). A partial list: Darshan Gulur Srinivasa, Erick Garcia, Jared Saussy, Danny Alexander, Joshua Thornton, Nerando Johnson, Brittani Smalls, Ann Vu, Zachary Williams, Paris Walters, Itzcoatl Salazar, Roberto Cervantes
