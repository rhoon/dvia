###Paris-Roubaix Data Sets

The final output (in the 'out' directory) are two files:

byRider.json, an associative array of every racer known to have participated in Paris-Roubaix, 
the years they participated, their rank and the points they would have gotten under the current
UCI ranking system (http://www.uci.ch/mm/Document/News/Rulesandregulation/17/73/59/2-ROA-20161108-E_English.PDF Page 60),
tracked individually and cumulatively.

parisRoubaix-fullv2.json contains every known racer in the history Paris-Roubaix, per race, their rank, speed, time and country (if known)
as well as the number of finishers, starters, and distance of the race (it's slightly variable). In a few cases, speed & time are estimated
based on rank due to incomplete records, in which case key in the data set 'est' is marked 'true'.

Neither of these data sets would exist without the incredible and complete resources on which they are based
at ProCyclingStats.com, BikeRaceInfo.com, and www.letour.com/paris-roubaix/2016/us/.