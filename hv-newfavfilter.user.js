// ==UserScript==
// @name           HV-NewFavFilter 1.0
// @namespace      http://github.com/lkraav/HV-NewFavFilter/
// @description    Filtreerib ainult uute postitustega foorumid ja threadid lemmikute lehel
// @include        http://foorum.hinnavaatlus.ee/favorites.php
// ==/UserScript==

function xpath(query, element) { 							// http://diveintogreasemonkey.org/patterns/match-attribute.html
    return document.evaluate(query, element, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
}

var foorumiTables = document.getElementsByClassName('forumline');			// siit peaksime saama neid 3 tk, millest üks on see suur ja põhiline

if (foorumiTables) {
	for (var jj = 0; jj < foorumiTables.length; jj++) {				// *** PASS #1 - kõigepealt koristame kõik mitte-uutega threadid ära ***
		var allRows, thisRow;

		allRows = xpath('.//tr', foorumiTables[jj]);				// otsime kõik read forumline tabelist välja (thanks: http://old.nabble.com/document.evaluate,-2nd-parameter,-I-don%27t-get-it-td12196999.html)

		for (var ii = 0; ii < allRows.snapshotLength; ii++) {
			thisRow = allRows.snapshotItem(ii);

			var forumlinkRowSnapshot = xpath(".//span[@class='forumlink']", thisRow);
													
			if (!forumlinkRowSnapshot.snapshotLength) {			// nüüd uurime kas on foorumi nime sisaldav rida?
				var newmsgRowSnapshot = xpath(".//img[@alt='uued postitused']", thisRow);

				if (!newmsgRowSnapshot.snapshotLength) { 		// ei olnud, aga võib-olla on uusi postitusi sisaldav rida?
					thisRow.parentNode.removeChild(thisRow);	// ei olnud foorumi nimi ega uusi postitusi, seega killime asja maha
				}
			}
			else {
				//thisRow.parentNode.removeChild(thisRow);		// killime lihtsalt foorumi nimed ka maha max-compact viewks (disabled, sest PASS #2 töötab päris hästi)
				var catheadRowSnapshot = xpath(".//td[@class='catLeft']", thisRow);

				if (catheadRowSnapshot.snapshotLength) {		// siin võtame tarbetud kategooriaread maha
					thisRow.parentNode.removeChild(thisRow);
				}
			}
		}

		allRows = xpath('.//tr', foorumiTables[jj]);				// *** PASS #2 - tühjade foorumite väljafiltreerimine ***

		for (var ii = 0; ii < allRows.snapshotLength; ii++) {			// otsime uuesti kõik read forumline tabelist välja
			thisRow = allRows.snapshotItem(ii);

			var forumlinkRowSnapshot = xpath(".//span[@class='forumlink']", thisRow);

			if (forumlinkRowSnapshot.snapshotLength) {			// nüüd uurime kas on foorumi nime sisaldav rida?
				newmsgRow = thisRow.nextSibling;

				while(newmsgRow.innerHTML == null)			// http://v3.thewatchmakerproject.com/journal/329/finding-html-elements-using-javascript-nextsibling-and-previoussibling
				{							// seda on meil vaja, sest nextSibling võib meile lihtsalt mingit whitespace teksti ka anda. seetõttu kammime niikaua kuni järgmine TR vastu ikkagi tuleb
					if (newmsgRow.nextSibling) {			// võimalik, et materjal sai otsa (http://github.com/lkraav/HV-NewFavFilter/issues/#issue/1)
						newmsgRow = newmsgRow.nextSibling;
					}
					else {
						thisRow.parentNode.removeChild(thisRow);
						return;
					}
				}
	
				var newmsgRowSnapshot = xpath(".//img[@alt='uued postitused']", newmsgRow);

				if (!newmsgRowSnapshot.snapshotLength) {		// siin alamfoorumis pole ühtegi uut postitust, seega paberhunti
					thisRow.parentNode.removeChild(thisRow);
				}

			}
		}
	}
}


