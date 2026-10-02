/**
 * KUMANI — Selector de localização internacional
 * País → se Moçambique: Província → Distrito
 * Dados: sem API externa, 100% gratuito e offline.
 */

const MOCAMBIQUE_ID = 'MZ';

const PROVINCIAS_MZ = [
  'Cabo Delgado','Gaza','Inhambane','Manica','Maputo Cidade',
  'Maputo Província','Nampula','Niassa','Sofala','Tete','Zambézia'
];

const DISTRITOS_MZ = {
  'Cabo Delgado': ['Ancuabe','Balama','Chiúre','Ibo','Macomia','Mecúfi','Meluco','Metuge','Mocímboa da Praia','Montepuez','Mueda','Muidumbe','Namuno','Nangade','Palma','Pemba','Quissanga'],
  'Gaza': ['Bilene','Chibuto','Chicualacuala','Chigubo','Chókwè','Chongoene','Guijá','Limpopo','Mabalane','Mandlakazi','Mapai','Massangena','Massingir','Xai-Xai'],
  'Inhambane': ['Funhalouro','Govuro','Homoine','Inharrime','Inhassoro','Jangamo','Mabote','Massinga','Maxixe','Morrumbene','Panda','Vilankulo','Zavala','Inhambane Cidade'],
  'Manica': ['Bárue','Chimoio','Gondola','Guro','Machaze','Macossa','Manica','Mossurize','Sussudenga','Tambara','Vanduzi'],
  'Maputo Cidade': ['KaMavota','KaMaxakeni','KaMpfumo','KaMubukwana','KaNyaka','KaTembe','Nlhamankulu'],
  'Maputo Província': ['Boane','Magude','Manhiça','Marracuene','Matola','Matutuíne','Moamba','Namaacha'],
  'Nampula': ['Angoche','Eráti','Lalaua','Larde','Liúpo','Malema','Meconta','Mecubúri','Memba','Mogincual','Mogovolas','Moma','Monapo','Mossuril','Muecate','Murrupula','Nacarôa','Namapa-Eráti','Nampula','Rapale','Ribáuè'],
  'Niassa': ['Chimbonila','Cuamba','Lago','Lichinga','Majune','Mandimba','Marrupa','Maúa','Mavago','Mecanhelas','Mecula','Metarica','Muembe','Ngauma','Nipepe','Sanga'],
  'Sofala': ['Bázi','Búzi','Caia','Chemba','Cheringoma','Chibabava','Dondo','Gorongosa','Machanga','Maringue','Marromeu','Muanza','Nhamatanda','Beira'],
  'Tete': ['Angónia','Cahora-Bassa','Changara','Chiuta','Dôa','Macanga','Marávia','Moatize','Moçambique','Mutarara','Tsangano','Tete','Zumbo'],
  'Zambézia': ['Alto Molócuè','Chinde','Gilé','Guruè','Ile','Inhassunge','Luabo','Lugela','Maganja da Costa','Milange','Mocuba','Mopeia','Morrumbala','Mulevala','Namarrói','Namacurra','Nicoadala','Pebane','Quelimane']
};

// Lista de países (código ISO + nome em português)
const PAISES = [
  {code:'MZ',name:'Moçambique'},{code:'AF',name:'Afeganistão'},{code:'ZA',name:'África do Sul'},
  {code:'AL',name:'Albânia'},{code:'DE',name:'Alemanha'},{code:'AD',name:'Andorra'},
  {code:'AO',name:'Angola'},{code:'AG',name:'Antígua e Barbuda'},{code:'SA',name:'Arábia Saudita'},
  {code:'DZ',name:'Argélia'},{code:'AR',name:'Argentina'},{code:'AM',name:'Arménia'},
  {code:'AU',name:'Austrália'},{code:'AT',name:'Áustria'},{code:'AZ',name:'Azerbaijão'},
  {code:'BS',name:'Bahamas'},{code:'BD',name:'Bangladesh'},{code:'BE',name:'Bélgica'},
  {code:'BZ',name:'Belize'},{code:'BJ',name:'Benim'},{code:'BO',name:'Bolívia'},
  {code:'BA',name:'Bósnia e Herzegovina'},{code:'BW',name:'Botswana'},{code:'BR',name:'Brasil'},
  {code:'BN',name:'Brunei'},{code:'BG',name:'Bulgária'},{code:'BF',name:'Burkina Faso'},
  {code:'BI',name:'Burundi'},{code:'CV',name:'Cabo Verde'},{code:'CM',name:'Camarões'},
  {code:'KH',name:'Camboja'},{code:'CA',name:'Canadá'},{code:'QA',name:'Catar'},
  {code:'KZ',name:'Cazaquistão'},{code:'TD',name:'Chade'},{code:'CL',name:'Chile'},
  {code:'CN',name:'China'},{code:'CY',name:'Chipre'},{code:'CO',name:'Colômbia'},
  {code:'KM',name:'Comores'},{code:'CG',name:'Congo'},{code:'CD',name:'Congo (RD)'},
  {code:'KP',name:'Coreia do Norte'},{code:'KR',name:'Coreia do Sul'},{code:'CI',name:'Costa do Marfim'},
  {code:'CR',name:'Costa Rica'},{code:'HR',name:'Croácia'},{code:'CU',name:'Cuba'},
  {code:'DK',name:'Dinamarca'},{code:'DJ',name:'Djibouti'},{code:'EG',name:'Egipto'},
  {code:'AE',name:'Emirados Árabes Unidos'},{code:'EC',name:'Equador'},{code:'ER',name:'Eritreia'},
  {code:'SK',name:'Eslováquia'},{code:'SI',name:'Eslovénia'},{code:'ES',name:'Espanha'},
  {code:'US',name:'Estados Unidos'},{code:'ET',name:'Etiópia'},{code:'FJ',name:'Fiji'},
  {code:'PH',name:'Filipinas'},{code:'FI',name:'Finlândia'},{code:'FR',name:'França'},
  {code:'GA',name:'Gabão'},{code:'GM',name:'Gâmbia'},{code:'GH',name:'Gana'},
  {code:'GE',name:'Geórgia'},{code:'GR',name:'Grécia'},{code:'GT',name:'Guatemala'},
  {code:'GN',name:'Guiné'},{code:'GQ',name:'Guiné Equatorial'},{code:'GW',name:'Guiné-Bissau'},
  {code:'GY',name:'Guiana'},{code:'HT',name:'Haiti'},{code:'NL',name:'Holanda'},
  {code:'HN',name:'Honduras'},{code:'HU',name:'Hungria'},{code:'YE',name:'Iémen'},
  {code:'IN',name:'Índia'},{code:'ID',name:'Indonésia'},{code:'IQ',name:'Iraque'},
  {code:'IR',name:'Irão'},{code:'IE',name:'Irlanda'},{code:'IS',name:'Islândia'},
  {code:'IL',name:'Israel'},{code:'IT',name:'Itália'},{code:'JM',name:'Jamaica'},
  {code:'JP',name:'Japão'},{code:'JO',name:'Jordânia'},{code:'KE',name:'Quénia'},
  {code:'KW',name:'Kuwait'},{code:'LA',name:'Laos'},{code:'LS',name:'Lesoto'},
  {code:'LB',name:'Líbano'},{code:'LR',name:'Libéria'},{code:'LY',name:'Líbia'},
  {code:'LI',name:'Liechtenstein'},{code:'LT',name:'Lituânia'},{code:'LU',name:'Luxemburgo'},
  {code:'MK',name:'Macedónia do Norte'},{code:'MG',name:'Madagáscar'},{code:'MW',name:'Malawi'},
  {code:'MY',name:'Malásia'},{code:'MV',name:'Maldivas'},{code:'ML',name:'Mali'},
  {code:'MT',name:'Malta'},{code:'MA',name:'Marrocos'},{code:'MR',name:'Mauritânia'},
  {code:'MU',name:'Maurícias'},{code:'MX',name:'México'},{code:'MM',name:'Myanmar'},
  {code:'NA',name:'Namíbia'},{code:'NP',name:'Nepal'},{code:'NI',name:'Nicarágua'},
  {code:'NE',name:'Níger'},{code:'NG',name:'Nigéria'},{code:'NO',name:'Noruega'},
  {code:'NZ',name:'Nova Zelândia'},{code:'OM',name:'Omã'},{code:'PK',name:'Paquistão'},
  {code:'PA',name:'Panamá'},{code:'PG',name:'Papua Nova Guiné'},{code:'PY',name:'Paraguai'},
  {code:'PE',name:'Peru'},{code:'PL',name:'Polónia'},{code:'PT',name:'Portugal'},
  {code:'KG',name:'Quirguistão'},{code:'RW',name:'Ruanda'},{code:'RO',name:'Roménia'},
  {code:'RU',name:'Rússia'},{code:'SV',name:'Salvador'},{code:'WS',name:'Samoa'},
  {code:'ST',name:'São Tomé e Príncipe'},{code:'SN',name:'Senegal'},{code:'SL',name:'Serra Leoa'},
  {code:'RS',name:'Sérvia'},{code:'SC',name:'Seychelles'},{code:'SD',name:'Sudão'},
  {code:'SS',name:'Sudão do Sul'},{code:'SE',name:'Suécia'},{code:'CH',name:'Suíça'},
  {code:'SR',name:'Suriname'},{code:'SZ',name:'Suazilândia'},{code:'SY',name:'Síria'},
  {code:'TJ',name:'Tajiquistão'},{code:'TZ',name:'Tanzânia'},{code:'TH',name:'Tailândia'},
  {code:'TL',name:'Timor-Leste'},{code:'TG',name:'Togo'},{code:'TO',name:'Tonga'},
  {code:'TT',name:'Trindade e Tobago'},{code:'TN',name:'Tunísia'},{code:'TM',name:'Turquemenistão'},
  {code:'TR',name:'Turquia'},{code:'TV',name:'Tuvalu'},{code:'UG',name:'Uganda'},
  {code:'UA',name:'Ucrânia'},{code:'UY',name:'Uruguai'},{code:'UZ',name:'Uzbequistão'},
  {code:'VU',name:'Vanuatu'},{code:'VE',name:'Venezuela'},{code:'VN',name:'Vietname'},
  {code:'ZM',name:'Zâmbia'},{code:'ZW',name:'Zimbabué'}
];

export function initLocationSelector(containerEl) {
  if (!containerEl) return;

  containerEl.innerHTML = `
    <div class="field">
      <label class="field__label" for="loc-pais">País<span class="field__required">*</span></label>
      <select class="field__input" id="loc-pais" name="pais" required>
        <option value="">Seleccione um país</option>
        ${PAISES.map(p => `<option value="${p.code}"${p.code === 'MZ' ? ' selected' : ''}>${p.name}</option>`).join('')}
      </select>
    </div>
    <div class="field" id="loc-provincia-wrap" style="display:block;">
      <label class="field__label" for="loc-provincia">Província</label>
      <select class="field__input" id="loc-provincia" name="provincia">
        <option value="">Seleccione uma província</option>
        ${PROVINCIAS_MZ.map(p => `<option value="${p}">${p}</option>`).join('')}
      </select>
    </div>
    <div class="field" id="loc-distrito-wrap" style="display:none;">
      <label class="field__label" for="loc-distrito">Distrito</label>
      <select class="field__input" id="loc-distrito" name="distrito">
        <option value="">Seleccione um distrito</option>
      </select>
    </div>
  `;

  const paisSel = containerEl.querySelector('#loc-pais');
  const provinciaWrap = containerEl.querySelector('#loc-provincia-wrap');
  const provinciaEl = containerEl.querySelector('#loc-provincia');
  const distritoWrap = containerEl.querySelector('#loc-distrito-wrap');
  const distritoEl = containerEl.querySelector('#loc-distrito');

  paisSel.addEventListener('change', () => {
    const isMZ = paisSel.value === MOCAMBIQUE_ID;
    provinciaWrap.style.display = isMZ ? 'block' : 'none';
    distritoWrap.style.display = 'none';
    provinciaEl.value = '';
    distritoEl.innerHTML = '<option value="">Seleccione um distrito</option>';
  });

  provinciaEl.addEventListener('change', () => {
    const distritos = DISTRITOS_MZ[provinciaEl.value] || [];
    distritoEl.innerHTML = '<option value="">Seleccione um distrito</option>' +
      distritos.map(d => `<option value="${d}">${d}</option>`).join('');
    distritoWrap.style.display = distritos.length ? 'block' : 'none';
  });
}
