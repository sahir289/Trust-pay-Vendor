import _ from "lodash";

export interface Country {
  name: string;
  image: string;
}

const imageAssets = import.meta.glob<{
  default: string;
}>("/src/assets/images/flags/*.{jpg,jpeg,png,svg}", { eager: true });

const fakers = {
  fakeCountries(): Array<Country> {
    const countries: Array<Country> = [
      {
        name: "French Polynesia",
        image: imageAssets["/src/assets/images/flags/pf.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Saint Martin",
        image: imageAssets["/src/assets/images/flags/mf.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Venezuela",
        image: imageAssets["/src/assets/images/flags/ve.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Réunion",
        image: imageAssets["/src/assets/images/flags/re.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "El Salvador",
        image: imageAssets["/src/assets/images/flags/sv.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Dominica",
        image: imageAssets["/src/assets/images/flags/dm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Gibraltar",
        image: imageAssets["/src/assets/images/flags/gi.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Kenya",
        image: imageAssets["/src/assets/images/flags/ke.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Brazil",
        image: imageAssets["/src/assets/images/flags/br.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Maldives",
        image: imageAssets["/src/assets/images/flags/mv.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "United States",
        image: imageAssets["/src/assets/images/flags/us.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Cook Islands",
        image: imageAssets["/src/assets/images/flags/ck.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Niue",
        image: imageAssets["/src/assets/images/flags/nu.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Seychelles",
        image: imageAssets["/src/assets/images/flags/sc.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Central African Republic",
        image: imageAssets["/src/assets/images/flags/cf.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Tokelau",
        image: imageAssets["/src/assets/images/flags/tk.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Vanuatu",
        image: imageAssets["/src/assets/images/flags/vu.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Gambia",
        image: imageAssets["/src/assets/images/flags/gm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Guyana",
        image: imageAssets["/src/assets/images/flags/gy.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Falkland Islands",
        image: imageAssets["/src/assets/images/flags/fk.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Belgium",
        image: imageAssets["/src/assets/images/flags/be.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Western Sahara",
        image: imageAssets["/src/assets/images/flags/eh.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Turkey",
        image: imageAssets["/src/assets/images/flags/tr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Saint Vincent and the Grenadines",
        image: imageAssets["/src/assets/images/flags/vc.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Pakistan",
        image: imageAssets["/src/assets/images/flags/pk.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Åland Islands",
        image: imageAssets["/src/assets/images/flags/ax.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Iran",
        image: imageAssets["/src/assets/images/flags/ir.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Indonesia",
        image: imageAssets["/src/assets/images/flags/id.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "New Zealand",
        image: imageAssets["/src/assets/images/flags/nz.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Afghanistan",
        image:
          imageAssets["/src/assets/images/flags/Flag_of_the_Taliban.svg"]
            ?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Guam",
        image: imageAssets["/src/assets/images/flags/gu.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Albania",
        image: imageAssets["/src/assets/images/flags/al.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "DR Congo",
        image: imageAssets["/src/assets/images/flags/cd.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Ivory Coast",
        image: imageAssets["/src/assets/images/flags/ci.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Sudan",
        image: imageAssets["/src/assets/images/flags/sd.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Timor-Leste",
        image: imageAssets["/src/assets/images/flags/tl.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Luxembourg",
        image: imageAssets["/src/assets/images/flags/lu.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Saudi Arabia",
        image: imageAssets["/src/assets/images/flags/sa.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Cambodia",
        image: imageAssets["/src/assets/images/flags/kh.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Nepal",
        image: imageAssets["/src/assets/images/flags/np.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "French Guiana",
        image: imageAssets["/src/assets/images/flags/gf.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Malaysia",
        image: imageAssets["/src/assets/images/flags/my.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Rwanda",
        image: imageAssets["/src/assets/images/flags/rw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Thailand",
        image: imageAssets["/src/assets/images/flags/th.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Antarctica",
        image: imageAssets["/src/assets/images/flags/aq.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Jordan",
        image: imageAssets["/src/assets/images/flags/jo.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Switzerland",
        image: imageAssets["/src/assets/images/flags/ch.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Comoros",
        image: imageAssets["/src/assets/images/flags/km.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Kosovo",
        image: imageAssets["/src/assets/images/flags/xk.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Isle of Man",
        image: imageAssets["/src/assets/images/flags/im.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Montenegro",
        image: imageAssets["/src/assets/images/flags/me.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Hong Kong",
        image: imageAssets["/src/assets/images/flags/hk.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Jersey",
        image: imageAssets["/src/assets/images/flags/je.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Tajikistan",
        image: imageAssets["/src/assets/images/flags/tj.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Bulgaria",
        image: imageAssets["/src/assets/images/flags/bg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Egypt",
        image: imageAssets["/src/assets/images/flags/eg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Malawi",
        image: imageAssets["/src/assets/images/flags/mw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Cape Verde",
        image: imageAssets["/src/assets/images/flags/cv.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Benin",
        image: imageAssets["/src/assets/images/flags/bj.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Morocco",
        image: imageAssets["/src/assets/images/flags/ma.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Ireland",
        image: imageAssets["/src/assets/images/flags/ie.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Moldova",
        image: imageAssets["/src/assets/images/flags/md.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Denmark",
        image: imageAssets["/src/assets/images/flags/dk.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Turkmenistan",
        image: imageAssets["/src/assets/images/flags/tm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Micronesia",
        image: imageAssets["/src/assets/images/flags/fm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Monaco",
        image: imageAssets["/src/assets/images/flags/mc.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Barbados",
        image: imageAssets["/src/assets/images/flags/bb.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Algeria",
        image: imageAssets["/src/assets/images/flags/dz.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "French Southern and Antarctic Lands",
        image: imageAssets["/src/assets/images/flags/tf.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Eritrea",
        image: imageAssets["/src/assets/images/flags/er.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Lesotho",
        image: imageAssets["/src/assets/images/flags/ls.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Tanzania",
        image: imageAssets["/src/assets/images/flags/tz.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Mali",
        image: imageAssets["/src/assets/images/flags/ml.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Niger",
        image: imageAssets["/src/assets/images/flags/ne.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Andorra",
        image: imageAssets["/src/assets/images/flags/ad.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "United Kingdom",
        image: imageAssets["/src/assets/images/flags/gb.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Germany",
        image: imageAssets["/src/assets/images/flags/de.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "United States Virgin Islands",
        image: imageAssets["/src/assets/images/flags/vi.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Somalia",
        image: imageAssets["/src/assets/images/flags/so.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Sint Maarten",
        image: imageAssets["/src/assets/images/flags/sx.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Cameroon",
        image: imageAssets["/src/assets/images/flags/cm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Dominican Republic",
        image: imageAssets["/src/assets/images/flags/do.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Guinea",
        image: imageAssets["/src/assets/images/flags/gn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Namibia",
        image: imageAssets["/src/assets/images/flags/na.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Montserrat",
        image: imageAssets["/src/assets/images/flags/ms.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "South Georgia",
        image: imageAssets["/src/assets/images/flags/gs.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Senegal",
        image: imageAssets["/src/assets/images/flags/sn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Bouvet Island",
        image: imageAssets["/src/assets/images/flags/bv.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Solomon Islands",
        image: imageAssets["/src/assets/images/flags/sb.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "France",
        image: imageAssets["/src/assets/images/flags/fr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Saint Helena, Ascension and Tristan da Cunha",
        image: imageAssets["/src/assets/images/flags/sh.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Macau",
        image: imageAssets["/src/assets/images/flags/mo.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Argentina",
        image: imageAssets["/src/assets/images/flags/ar.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Bosnia and Herzegovina",
        image: imageAssets["/src/assets/images/flags/ba.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Anguilla",
        image: imageAssets["/src/assets/images/flags/ai.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Guernsey",
        image: imageAssets["/src/assets/images/flags/gg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Djibouti",
        image: imageAssets["/src/assets/images/flags/dj.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Saint Kitts and Nevis",
        image: imageAssets["/src/assets/images/flags/kn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Syria",
        image: imageAssets["/src/assets/images/flags/sy.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Puerto Rico",
        image: imageAssets["/src/assets/images/flags/pr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Peru",
        image: imageAssets["/src/assets/images/flags/pe.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "San Marino",
        image: imageAssets["/src/assets/images/flags/sm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Australia",
        image: imageAssets["/src/assets/images/flags/au.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "New Caledonia",
        image: imageAssets["/src/assets/images/flags/nc.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Jamaica",
        image: imageAssets["/src/assets/images/flags/jm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Kazakhstan",
        image: imageAssets["/src/assets/images/flags/kz.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Sierra Leone",
        image: imageAssets["/src/assets/images/flags/sl.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Palau",
        image: imageAssets["/src/assets/images/flags/pw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "South Korea",
        image: imageAssets["/src/assets/images/flags/kr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Saint Pierre and Miquelon",
        image: imageAssets["/src/assets/images/flags/pm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Belize",
        image: imageAssets["/src/assets/images/flags/bz.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Papua New Guinea",
        image: imageAssets["/src/assets/images/flags/pg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Iceland",
        image: imageAssets["/src/assets/images/flags/is.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "American Samoa",
        image: imageAssets["/src/assets/images/flags/as.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Burkina Faso",
        image: imageAssets["/src/assets/images/flags/bf.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Portugal",
        image: imageAssets["/src/assets/images/flags/pt.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Taiwan",
        image: imageAssets["/src/assets/images/flags/tw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Japan",
        image: imageAssets["/src/assets/images/flags/jp.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "China",
        image: imageAssets["/src/assets/images/flags/cn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Lebanon",
        image: imageAssets["/src/assets/images/flags/lb.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Sri Lanka",
        image: imageAssets["/src/assets/images/flags/lk.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Guatemala",
        image: imageAssets["/src/assets/images/flags/gt.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Serbia",
        image: imageAssets["/src/assets/images/flags/rs.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Madagascar",
        image: imageAssets["/src/assets/images/flags/mg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Eswatini",
        image: imageAssets["/src/assets/images/flags/sz.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Romania",
        image: imageAssets["/src/assets/images/flags/ro.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Antigua and Barbuda",
        image: imageAssets["/src/assets/images/flags/ag.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Curaçao",
        image: imageAssets["/src/assets/images/flags/cw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Zambia",
        image: imageAssets["/src/assets/images/flags/zm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Zimbabwe",
        image: imageAssets["/src/assets/images/flags/zw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Tunisia",
        image: imageAssets["/src/assets/images/flags/tn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "United Arab Emirates",
        image: imageAssets["/src/assets/images/flags/ae.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Mongolia",
        image: imageAssets["/src/assets/images/flags/mn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Norway",
        image: imageAssets["/src/assets/images/flags/no.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Greenland",
        image: imageAssets["/src/assets/images/flags/gl.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Uruguay",
        image: imageAssets["/src/assets/images/flags/uy.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Bahamas",
        image: imageAssets["/src/assets/images/flags/bs.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Russia",
        image: imageAssets["/src/assets/images/flags/ru.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "British Virgin Islands",
        image: imageAssets["/src/assets/images/flags/vg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Wallis and Futuna",
        image: imageAssets["/src/assets/images/flags/wf.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Chad",
        image: imageAssets["/src/assets/images/flags/td.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Saint Lucia",
        image: imageAssets["/src/assets/images/flags/lc.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Yemen",
        image: imageAssets["/src/assets/images/flags/ye.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "United States Minor Outlying Islands",
        image: imageAssets["/src/assets/images/flags/um.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Sweden",
        image: imageAssets["/src/assets/images/flags/se.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Svalbard and Jan Mayen",
        image: imageAssets["/src/assets/images/flags/sj.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Laos",
        image: imageAssets["/src/assets/images/flags/la.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Latvia",
        image: imageAssets["/src/assets/images/flags/lv.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Colombia",
        image: imageAssets["/src/assets/images/flags/co.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Grenada",
        image: imageAssets["/src/assets/images/flags/gd.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Saint Barthélemy",
        image: imageAssets["/src/assets/images/flags/bl.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Canada",
        image: imageAssets["/src/assets/images/flags/ca.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Heard Island and McDonald Islands",
        image: imageAssets["/src/assets/images/flags/hm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "India",
        image: imageAssets["/src/assets/images/flags/in.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Guinea-Bissau",
        image: imageAssets["/src/assets/images/flags/gw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "North Macedonia",
        image: imageAssets["/src/assets/images/flags/mk.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Paraguay",
        image: imageAssets["/src/assets/images/flags/py.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Croatia",
        image: imageAssets["/src/assets/images/flags/hr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Costa Rica",
        image: imageAssets["/src/assets/images/flags/cr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Uganda",
        image: imageAssets["/src/assets/images/flags/ug.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Caribbean Netherlands",
        image: imageAssets["/src/assets/images/flags/bq.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Bolivia",
        image: imageAssets["/src/assets/images/flags/bo.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Togo",
        image: imageAssets["/src/assets/images/flags/tg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Mayotte",
        image: imageAssets["/src/assets/images/flags/yt.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Marshall Islands",
        image: imageAssets["/src/assets/images/flags/mh.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "North Korea",
        image: imageAssets["/src/assets/images/flags/kp.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Netherlands",
        image: imageAssets["/src/assets/images/flags/nl.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "British Indian Ocean Territory",
        image: imageAssets["/src/assets/images/flags/io.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Malta",
        image: imageAssets["/src/assets/images/flags/mt.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Mauritius",
        image: imageAssets["/src/assets/images/flags/mu.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Norfolk Island",
        image: imageAssets["/src/assets/images/flags/nf.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Honduras",
        image: imageAssets["/src/assets/images/flags/hn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Spain",
        image: imageAssets["/src/assets/images/flags/es.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Estonia",
        image: imageAssets["/src/assets/images/flags/ee.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Kyrgyzstan",
        image: imageAssets["/src/assets/images/flags/kg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Chile",
        image: imageAssets["/src/assets/images/flags/cl.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Bermuda",
        image: imageAssets["/src/assets/images/flags/bm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Equatorial Guinea",
        image: imageAssets["/src/assets/images/flags/gq.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Liberia",
        image: imageAssets["/src/assets/images/flags/lr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Pitcairn Islands",
        image: imageAssets["/src/assets/images/flags/pn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Libya",
        image: imageAssets["/src/assets/images/flags/ly.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Liechtenstein",
        image: imageAssets["/src/assets/images/flags/li.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Vatican City",
        image: imageAssets["/src/assets/images/flags/va.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Christmas Island",
        image: imageAssets["/src/assets/images/flags/cx.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Oman",
        image: imageAssets["/src/assets/images/flags/om.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Philippines",
        image: imageAssets["/src/assets/images/flags/ph.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Poland",
        image: imageAssets["/src/assets/images/flags/pl.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Faroe Islands",
        image: imageAssets["/src/assets/images/flags/fo.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Bahrain",
        image: imageAssets["/src/assets/images/flags/bh.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Belarus",
        image: imageAssets["/src/assets/images/flags/by.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Slovenia",
        image: imageAssets["/src/assets/images/flags/si.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Guadeloupe",
        image: imageAssets["/src/assets/images/flags/gp.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Qatar",
        image: imageAssets["/src/assets/images/flags/qa.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Vietnam",
        image: imageAssets["/src/assets/images/flags/vn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Mauritania",
        image: imageAssets["/src/assets/images/flags/mr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Singapore",
        image: imageAssets["/src/assets/images/flags/sg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Georgia",
        image: imageAssets["/src/assets/images/flags/ge.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Burundi",
        image: imageAssets["/src/assets/images/flags/bi.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Nauru",
        image: imageAssets["/src/assets/images/flags/nr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "South Sudan",
        image: imageAssets["/src/assets/images/flags/ss.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Samoa",
        image: imageAssets["/src/assets/images/flags/ws.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Cocos (Keeling) Islands",
        image: imageAssets["/src/assets/images/flags/cc.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Republic of the Congo",
        image: imageAssets["/src/assets/images/flags/cg.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Cyprus",
        image: imageAssets["/src/assets/images/flags/cy.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Kuwait",
        image: imageAssets["/src/assets/images/flags/kw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Trinidad and Tobago",
        image: imageAssets["/src/assets/images/flags/tt.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Tuvalu",
        image: imageAssets["/src/assets/images/flags/tv.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Angola",
        image: imageAssets["/src/assets/images/flags/ao.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Tonga",
        image: imageAssets["/src/assets/images/flags/to.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Greece",
        image: imageAssets["/src/assets/images/flags/gr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Mozambique",
        image: imageAssets["/src/assets/images/flags/mz.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Myanmar",
        image: imageAssets["/src/assets/images/flags/mm.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Austria",
        image: imageAssets["/src/assets/images/flags/at.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Ethiopia",
        image: imageAssets["/src/assets/images/flags/et.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Martinique",
        image: imageAssets["/src/assets/images/flags/mq.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Azerbaijan",
        image: imageAssets["/src/assets/images/flags/az.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Uzbekistan",
        image: imageAssets["/src/assets/images/flags/uz.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Bangladesh",
        image: imageAssets["/src/assets/images/flags/bd.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Armenia",
        image: imageAssets["/src/assets/images/flags/am.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Nigeria",
        image: imageAssets["/src/assets/images/flags/ng.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "South Africa",
        image: imageAssets["/src/assets/images/flags/za.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Brunei",
        image: imageAssets["/src/assets/images/flags/bn.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Italy",
        image: imageAssets["/src/assets/images/flags/it.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Finland",
        image: imageAssets["/src/assets/images/flags/fi.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Israel",
        image: imageAssets["/src/assets/images/flags/il.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Aruba",
        image: imageAssets["/src/assets/images/flags/aw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Nicaragua",
        image: imageAssets["/src/assets/images/flags/ni.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Haiti",
        image: imageAssets["/src/assets/images/flags/ht.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Kiribati",
        image: imageAssets["/src/assets/images/flags/ki.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Turks and Caicos Islands",
        image: imageAssets["/src/assets/images/flags/tc.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Cayman Islands",
        image: imageAssets["/src/assets/images/flags/ky.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Ukraine",
        image: imageAssets["/src/assets/images/flags/ua.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Mexico",
        image: imageAssets["/src/assets/images/flags/mx.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Palestine",
        image: imageAssets["/src/assets/images/flags/ps.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Fiji",
        image: imageAssets["/src/assets/images/flags/fj.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Slovakia",
        image: imageAssets["/src/assets/images/flags/sk.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Ghana",
        image: imageAssets["/src/assets/images/flags/gh.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Suriname",
        image: imageAssets["/src/assets/images/flags/sr.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Cuba",
        image: imageAssets["/src/assets/images/flags/cu.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Bhutan",
        image: imageAssets["/src/assets/images/flags/bt.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Hungary",
        image: imageAssets["/src/assets/images/flags/hu.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "São Tomé and Príncipe",
        image: imageAssets["/src/assets/images/flags/st.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Iraq",
        image: imageAssets["/src/assets/images/flags/iq.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Czechia",
        image: imageAssets["/src/assets/images/flags/cz.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Lithuania",
        image: imageAssets["/src/assets/images/flags/lt.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Northern Mariana Islands",
        image: imageAssets["/src/assets/images/flags/mp.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Botswana",
        image: imageAssets["/src/assets/images/flags/bw.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Panama",
        image: imageAssets["/src/assets/images/flags/pa.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Gabon",
        image: imageAssets["/src/assets/images/flags/ga.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
      {
        name: "Ecuador",
        image: imageAssets["/src/assets/images/flags/ec.svg"]?.default || "/src/assets/images/flags/default.svg",
      },
    ];

    return _.shuffle(countries);
  },
};

export default fakers;
