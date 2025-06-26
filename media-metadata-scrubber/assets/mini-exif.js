function m(n, e, r) {
  for (var a = "", t = e; t < e + r; t++)
    a += String.fromCharCode(n.getUint8(t));
  return a;
}
function k(n) {
  return new Uint8Array([
    n >> 24 & 255,
    n >> 16 & 255,
    n >> 8 & 255,
    n & 255
  ]);
}
function N(n) {
  return new Uint8Array([
    n >> 8 & 255,
    n & 255
  ]);
}
function _(n) {
  return Uint8Array.from(Array.from(n).map((e) => e.charCodeAt(0)));
}
function S(...n) {
  const e = new Uint8Array(n.reduce((r, a) => r + a.byteLength, 0));
  return n.reduce((r, a) => (e.set(new Uint8Array(a), r), r + a.byteLength), 0), e.buffer;
}
function b(n, e) {
  if (!document) return console.error("[MiNi exif]: download file is browser only");
  if (!e) return console.error("[MiNi exif]: download missing output filename");
  if (!n || !(n instanceof ArrayBuffer) && !(n instanceof Blob)) return console.error("[MiNi exif]: download wrong data input");
  let r;
  n instanceof ArrayBuffer && (r = new Blob([n]));
  var a = document.createElement("a");
  a.href = URL.createObjectURL(r), a.download = e, a.click();
}
var w = {
  256: "ImageWidth",
  257: "ImageHeight",
  34665: "ExifIFDPointer",
  34675: "ICCProfileIFDPointer",
  34853: "GPSInfoIFDPointer",
  258: "BitsPerSample",
  259: "Compression",
  262: "PhotometricInterpretation",
  274: "Orientation",
  277: "SamplesPerPixel",
  284: "PlanarConfiguration",
  530: "YCbCrSubSampling",
  531: "YCbCrPositioning",
  282: "XResolution",
  283: "YResolution",
  296: "ResolutionUnit",
  273: "StripOffsets",
  278: "RowsPerStrip",
  279: "StripByteCounts",
  513: "JPEGInterchangeFormat",
  514: "JPEGInterchangeFormatLength",
  301: "TransferFunction",
  318: "WhitePoint",
  319: "PrimaryChromaticities",
  529: "YCbCrCoefficients",
  532: "ReferenceBlackWhite",
  306: "DateTime",
  270: "ImageDescription",
  271: "Make",
  272: "Model",
  305: "Software",
  315: "Artist",
  316: "HostComputer",
  33432: "Copyright"
}, X = {
  // version tags
  36864: "ExifVersion",
  // EXIF version
  40960: "FlashpixVersion",
  // Flashpix format version
  // colorspace tags
  40961: "ColorSpace",
  // Color space information tag (0x1 sRGB, 0xFFFF uncalibrated)
  // image configuration
  40962: "PixelXDimension",
  // Valid width of meaningful image
  40963: "PixelYDimension",
  // Valid height of meaningful image
  37121: "ComponentsConfiguration",
  // Information about channels
  37122: "CompressedBitsPerPixel",
  // Compressed bits per pixel
  // user information
  //0x927C: "MakerNote",               // Any desired information written by the manufacturer
  //0x9286: "UserComment",             // Comments by user
  // related file
  40964: "RelatedSoundFile",
  // Name of related sound file
  // date and time
  36867: "DateTimeOriginal",
  // Date and time when the original image was generated
  36868: "DateTimeDigitized",
  // Date and time when the image was stored digitally
  37520: "SubsecTime",
  // Fractions of seconds for DateTime
  37521: "SubsecTimeOriginal",
  // Fractions of seconds for DateTimeOriginal
  37522: "SubsecTimeDigitized",
  // Fractions of seconds for DateTimeDigitized
  // picture-taking conditions
  33434: "ExposureTime",
  // Exposure time (in seconds)
  33437: "FNumber",
  // F number
  34850: "ExposureProgram",
  // Exposure program
  34852: "SpectralSensitivity",
  // Spectral sensitivity
  34855: "ISOSpeedRatings",
  // ISO speed rating
  34856: "OECF",
  // Optoelectric conversion factor
  37377: "ShutterSpeedValue",
  // Shutter speed
  37378: "ApertureValue",
  // Lens aperture
  37379: "BrightnessValue",
  // Value of brightness
  37380: "ExposureBias",
  // Exposure bias
  37381: "MaxApertureValue",
  // Smallest F number of lens
  37382: "SubjectDistance",
  // Distance to subject in meters
  37383: "MeteringMode",
  // Metering mode
  37384: "LightSource",
  // Kind of light source
  37385: "Flash",
  // Flash status
  37396: "SubjectArea",
  // Location and area of main subject
  37386: "FocalLength",
  // Focal length of the lens in mm
  41483: "FlashEnergy",
  // Strobe energy in BCPS
  41484: "SpatialFrequencyResponse",
  //
  41486: "FocalPlaneXResolution",
  // Number of pixels in width direction per FocalPlaneResolutionUnit
  41487: "FocalPlaneYResolution",
  // Number of pixels in height direction per FocalPlaneResolutionUnit
  41488: "FocalPlaneResolutionUnit",
  // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
  41492: "SubjectLocation",
  // Location of subject in image
  41493: "ExposureIndex",
  // Exposure index selected on camera
  41495: "SensingMethod",
  // Image sensor type
  41728: "FileSource",
  // Image source (3 == DSC)
  41729: "SceneType",
  // Scene type (1 == directly photographed)
  41730: "CFAPattern",
  // Color filter array geometric pattern
  41985: "CustomRendered",
  // Special processing
  41986: "ExposureMode",
  // Exposure mode
  41987: "WhiteBalance",
  // 1 = auto white balance, 2 = manual
  41988: "DigitalZoomRation",
  // Digital zoom ratio
  41989: "FocalLengthIn35mmFilm",
  // Equivalent foacl length assuming 35mm film camera (in mm)
  41990: "SceneCaptureType",
  // Type of scene
  41991: "GainControl",
  // Degree of overall image gain adjustment
  41992: "Contrast",
  // Direction of contrast processing applied by camera
  41993: "Saturation",
  // Direction of saturation processing applied by camera
  41994: "Sharpness",
  // Direction of sharpness processing applied by camera
  41995: "DeviceSettingDescription",
  //
  41996: "SubjectDistanceRange",
  // Distance to subject
  42035: "LensMake",
  // 
  42036: "LensModel",
  // 
  // other tags
  //0xA005: "InteroperabilityIFDPointer",
  42016: "ImageUniqueID"
  // Identifier assigned uniquely to each image
}, j = {
  0: "GPSVersionID",
  1: "GPSLatitudeRef",
  2: "GPSLatitude",
  3: "GPSLongitudeRef",
  4: "GPSLongitude",
  5: "GPSAltitudeRef",
  6: "GPSAltitude",
  7: "GPSTimeStamp",
  8: "GPSSatellites",
  9: "GPSStatus",
  10: "GPSMeasureMode",
  11: "GPSDOP",
  12: "GPSSpeedRef",
  13: "GPSSpeed",
  14: "GPSTrackRef",
  15: "GPSTrack",
  16: "GPSImgDirectionRef",
  17: "GPSImgDirection",
  18: "GPSMapDatum",
  19: "GPSDestLatitudeRef",
  20: "GPSDestLatitude",
  21: "GPSDestLongitudeRef",
  22: "GPSDestLongitude",
  23: "GPSDestBearingRef",
  24: "GPSDestBearing",
  25: "GPSDestDistanceRef",
  26: "GPSDestDistance",
  27: "GPSProcessingMethod",
  28: "GPSAreaInformation",
  29: "GPSDateStamp",
  30: "GPSDifferential"
}, y = {
  ExposureMode: {
    0: "Auto",
    1: "Manual",
    2: "Auto Bracket"
  },
  ExposureProgram: {
    0: "Not defined",
    1: "Manual",
    2: "Normal program",
    3: "Aperture priority",
    4: "Shutter priority",
    5: "Creative program",
    6: "Action program",
    7: "Portrait mode",
    8: "Landscape mode"
  },
  MeteringMode: {
    0: "Unknown",
    1: "Average",
    2: "CenterWeightedAverage",
    3: "Spot",
    4: "MultiSpot",
    5: "Pattern",
    6: "Partial",
    255: "Other"
  },
  LightSource: {
    0: "Unknown",
    1: "Daylight",
    2: "Fluorescent",
    3: "Tungsten (incandescent light)",
    4: "Flash",
    9: "Fine weather",
    10: "Cloudy weather",
    11: "Shade",
    12: "Daylight fluorescent (D 5700 - 7100K)",
    13: "Day white fluorescent (N 4600 - 5400K)",
    14: "Cool white fluorescent (W 3900 - 4500K)",
    15: "White fluorescent (WW 3200 - 3700K)",
    17: "Standard light A",
    18: "Standard light B",
    19: "Standard light C",
    20: "D55",
    21: "D65",
    22: "D75",
    23: "D50",
    24: "ISO studio tungsten",
    255: "Other"
  },
  Flash: {
    0: "Flash did not fire",
    1: "Flash fired",
    5: "Strobe return light not detected",
    7: "Strobe return light detected",
    9: "Flash fired, compulsory flash mode",
    13: "Flash fired, compulsory flash mode, return light not detected",
    15: "Flash fired, compulsory flash mode, return light detected",
    16: "Flash did not fire, compulsory flash mode",
    24: "Flash did not fire, auto mode",
    25: "Flash fired, auto mode",
    29: "Flash fired, auto mode, return light not detected",
    31: "Flash fired, auto mode, return light detected",
    32: "No flash function",
    65: "Flash fired, red-eye reduction mode",
    69: "Flash fired, red-eye reduction mode, return light not detected",
    71: "Flash fired, red-eye reduction mode, return light detected",
    73: "Flash fired, compulsory flash mode, red-eye reduction mode",
    77: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
    79: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
    89: "Flash fired, auto mode, red-eye reduction mode",
    93: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
    95: "Flash fired, auto mode, return light detected, red-eye reduction mode"
  },
  SensingMethod: {
    1: "Not defined",
    2: "One-chip color area sensor",
    3: "Two-chip color area sensor",
    4: "Three-chip color area sensor",
    5: "Color sequential area sensor",
    7: "Trilinear sensor",
    8: "Color sequential linear sensor"
  },
  SceneCaptureType: {
    0: "Standard",
    1: "Landscape",
    2: "Portrait",
    3: "Night scene"
  },
  SceneType: {
    1: "Directly photographed"
  },
  CustomRendered: {
    0: "Normal process",
    1: "Custom process"
  },
  WhiteBalance: {
    0: "Auto white balance",
    1: "Manual white balance"
  },
  GainControl: {
    0: "None",
    1: "Low gain up",
    2: "High gain up",
    3: "Low gain down",
    4: "High gain down"
  },
  Contrast: {
    0: "Normal",
    1: "Soft",
    2: "Hard"
  },
  Saturation: {
    0: "Normal",
    1: "Low saturation",
    2: "High saturation"
  },
  Sharpness: {
    0: "Normal",
    1: "Soft",
    2: "Hard"
  },
  SubjectDistanceRange: {
    0: "Unknown",
    1: "Macro",
    2: "Close view",
    3: "Distant view"
  },
  FileSource: {
    3: "DSC"
  },
  Components: {
    0: "",
    1: "Y",
    2: "Cb",
    3: "Cr",
    4: "R",
    5: "G",
    6: "B"
  },
  ColorSpace: {
    1: "sRGB",
    2: "Adobe RGB",
    65533: "Wide Gamut RGB",
    65534: "ICC Profile",
    65535: "Uncalibrated"
  }
};
function C(n, e, r, a, t) {
  var f = n.getUint16(r, !t), o = {}, u, i, c;
  for (c = 0; c < f; c++) {
    u = r + c * 12 + 2;
    const l = n.getUint16(u, !t);
    i = a[l], i && (o[i] = z(n, u, e, r, t));
  }
  return o;
}
function z(n, e, r, a, t) {
  var f = n.getUint16(e + 2, !t), o = n.getUint32(e + 4, !t), u = n.getUint32(e + 8, !t) + r, i, c, l, s, x, g;
  switch (f) {
    case 1:
    // byte, 8-bit unsigned int
    case 7:
      if (o == 1)
        i = e + 8, l = n.getUint8(i, !t);
      else
        for (i = o > 4 ? u : e + 8, c = [], s = 0; s < o; s++)
          c[s] = n.getUint8(i + s);
      break;
    case 2:
      i = o > 4 ? u : e + 8, c = m(n, i, o - 1), c.length;
      break;
    case 3:
      if (o == 1)
        i = e + 8, l = n.getUint16(i, !t);
      else
        for (i = o > 2 ? u : e + 8, c = [], s = 0; s < o; s++)
          c[s] = n.getUint16(i + 2 * s, !t);
      break;
    case 4:
      if (o == 1)
        i = e + 8, l = n.getUint32(i, !t);
      else
        for (i = u, c = [], s = 0; s < o; s++)
          c[s] = n.getUint32(i + 4 * s, !t);
      break;
    case 9:
      if (o == 1)
        i = e + 8, l = n.getInt32(i, !t);
      else
        for (i = u, c = [], s = 0; s < o; s++)
          c[s] = n.getInt32(i + 4 * s, !t);
      break;
    case 5:
      if (o == 1)
        i = u, x = n.getUint32(i, !t), g = n.getUint32(i + 4, !t), l = new Number(x / g), l.numerator = x, l.denominator = g;
      else
        for (i = u, c = [], s = 0; s < o; s++)
          x = n.getUint32(i + 8 * s, !t), g = n.getUint32(i + 4 + 8 * s, !t), c[s] = new Number(x / g), c[s].numerator = x, c[s].denominator = g;
      break;
    case 10:
      if (o == 1)
        i = u, x = n.getInt32(i, !t), g = n.getInt32(i + 4, !t), l = new Number(x / g), l.numerator = x, l.denominator = g;
      else
        for (i = u, c = [], s = 0; s < o; s++)
          x = n.getInt32(i + 8 * s, !t), g = n.getInt32(i + 4 + 8 * s, !t), c[s] = new Number(x / g), c[s].numerator = x, c[s].denominator = g;
      break;
  }
  if (f) return {
    value: c || l,
    offset: i - r,
    type: f
    /*len, type_str:types[type-1]*/
  };
}
function D(n, e = 0) {
  if (!(n instanceof ArrayBuffer)) return console.error("[MiNi exif]: input must be an ArrayBuffer");
  var r, a, t, f, o;
  const u = new DataView(n);
  if (u.getUint16(e) == 18761)
    r = !1;
  else if (u.getUint16(e) == 19789)
    r = !0;
  else
    return console.error("[MiNi exif]: Not valid TIFF data! (no 0x4949 or 0x4D4D)"), !1;
  if (u.getUint16(e + 2, !r) != 42)
    return console.error("[MiNi exif]: Not valid TIFF data! (no 0x002A)"), !1;
  var i = u.getUint32(e + 4, !r);
  if (i < 8)
    return console.error("[MiNi exif]: Not valid TIFF data! (First offset less than 8)", u.getUint32(tiffOffset + 4, !r)), !1;
  if (a = { tiff: C(u, e, e + i, w, r) }, a.tiff.ExifIFDPointer) {
    f = C(u, e, e + a.tiff.ExifIFDPointer.value, X, r);
    for (t in f)
      switch (t) {
        case "LightSource":
        case "Flash":
        case "MeteringMode":
        case "ExposureMode":
        case "ExposureProgram":
        case "SensingMethod":
        case "SceneCaptureType":
        case "SceneType":
        case "CustomRendered":
        case "WhiteBalance":
        case "GainControl":
        case "Contrast":
        case "Saturation":
        case "Sharpness":
        case "SubjectDistanceRange":
        case "FileSource":
        case "ColorSpace":
          f[t].hvalue = y[t][f[t].value];
          break;
        case "ExposureTime":
          f[t].hvalue = f[t].value.numerator + "/" + f[t].value.denominator;
          break;
        case "ShutterSpeedValue":
          f[t].hvalue = "1/" + Math.round(Math.pow(2, f[t].value));
          break;
        case "ExifVersion":
        case "FlashpixVersion":
          f[t].hvalue = String.fromCharCode(f[t].value[0], f[t].value[1], f[t].value[2], f[t].value[3]);
          break;
        case "ApertureValue":
        case "BrightnessValue":
          f[t].hvalue = Math.round(f[t].value * 1e3) / 1e3;
          break;
        case "ComponentsConfiguration":
          f[t].hvalue = y.Components[f[t].value[0]] + y.Components[f[t].value[1]] + y.Components[f[t].value[2]] + y.Components[f[t].value[3]];
          break;
      }
    a.exif = f, delete a.tiff.ExifIFDPointer;
  }
  if (a.tiff.GPSInfoIFDPointer) {
    o = C(u, e, e + a.tiff.GPSInfoIFDPointer.value, j, r);
    for (t in o)
      switch (t) {
        case "GPSVersionID":
          o[t].hvalue = o[t].value[0] + "." + o[t].value[1] + "." + o[t].value[2] + "." + o[t].value[3];
          break;
        //ADDED
        case "GPSLatitude":
          o[t].hvalue = o[t].value[0] + o[t].value[1] / 60 + o[t].value[2] / 3600, o[t].hvalue = (o.GPSLatitudeRef.value === "N" ? 1 : -1) * o[t].hvalue;
          break;
        case "GPSLongitude":
          o[t].hvalue = o[t].value[0] + o[t].value[1] / 60 + o[t].value[2] / 3600, o[t].hvalue = (o.GPSLongitudeRef.value === "E" ? 1 : -1) * o[t].hvalue;
          break;
        case "GPSTimeStamp":
          o[t].hvalue = o[t].value[0].toString().padStart(2, "0") + ":" + o[t].value[1].toString().padStart(2, "0") + ":" + o[t].value[2].toString().padStart(2, "0") + " UTC";
          break;
      }
    a.gps = o, delete a.tiff.GPSInfoIFDPointer;
  }
  return a;
}
function P(n, e, r, a, t, f) {
  if (!n || !r || !a || !t || !e) return !1;
  const o = ["exif", "tiff", "gps"];
  if (!o.includes(r)) return console.error("[MiNi exif]: area must be one of", o);
  if (!n[r][a]) return console.error("[MiNi exif]: '" + r + "/" + a + "' not present");
  if (!e) return !1;
  if (f) {
    if (typeof t != typeof f) return console.error("[MiNi exif]: newvalue type mismatch vs newvalue2", t, f);
    if (Array.isArray(t)) {
      let d = [];
      for (let h = 0; h < t.length; h++) {
        let p = new Number(t[h] / f[h]);
        p.numerator = t[h], p.denominator = f[h], d.push(p);
      }
      t = d;
    } else {
      let d = new Number(t / f);
      d.numerator = t, d.denominator = f, t = d;
    }
  }
  const u = n[r][a], i = u.value.length || 1;
  if (typeof t != typeof u.value) return console.error("[MiNi exif]: newvalue type mismatch vs oldvalue", u.value, t);
  if (i > 1 && (!t.length || t.length < 1 || t.length > i)) return console.error("[MiNi exif]: newvalue too long", u.value, t);
  if (i > 1 && t.length < i)
    if (Array.isArray(u.value))
      for (let d = 0; d < i - t.length; d++)
        t.push(0);
    else if (typeof u.value == "string")
      t = t.concat(" ".repeat(i - t.length));
    else return console.error("[MiNi exif]: unknown type", u.value, t);
  const c = new DataView(e);
  let l, s;
  if (c.getUint16(0) == 18761 ? l = !1 : c.getUint16(0) == 19789 && (l = !0), l === void 0) return console.error("[MiNi exif]: exif_raw corrupted");
  const x = u.type, g = u.offset;
  switch (x) {
    case 1:
    // byte, 8-bit unsigned int
    case 7:
      if (i == 1)
        c.setUint8(g, t, !l);
      else
        for (s = 0; s < i; s++)
          c.setUint8(g + s, t[s], !l);
      break;
    case 2:
      for (s = 0; s < i; s++)
        c.setUint8(g + s, t.charCodeAt(s), !l);
      break;
    case 3:
      if (i == 1)
        c.setUint16(g, t, !l);
      else
        for (s = 0; s < i; s++)
          c.setUint16(g + s, t[s], !l);
      break;
    case 4:
      if (i == 1)
        c.setUint32(g, t, !l);
      else
        for (s = 0; s < i; s++)
          c.setUint32(g + s, t[s], !l);
      break;
    case 9:
      if (i == 1)
        c.setInt32(g, t, !l);
      else
        for (s = 0; s < i; s++)
          c.setInt32(g + s, t[s], !l);
      break;
    case 5:
      if (i == 1)
        c.setUint32(g, t.numerator, !l), c.setUint32(g + 4, t.denominator, !l);
      else
        for (s = 0; s < i; s++)
          c.setUint32(g + 8 * s, t[s].numerator, !l), c.setUint32(g + 4 + 8 * s, t[s].denominator, !l);
      break;
    case 10:
      if (i == 1)
        c.setInt32(g, t.numerator, !l), c.setInt32(g + 4, t.denominator, !l);
      else
        for (s = 0; s < i; s++)
          c.setInt32(g + 8 * s, t[s].numerator, !l), c.setInt32(g + 4 + 8 * s, t[s].denominator, !l);
      break;
  }
  return e;
}
function I(n, e = 0) {
  if (!(n instanceof ArrayBuffer)) return console.error("[MiNi exif]: input must be an ArrayBuffer");
  const r = new DataView(n);
  if (r.getUint32(e + 36) !== 1633907568) return console.error("[MiNi exif]: ICC missing valid signature");
  const a = m(r, e + 16, 4), t = r.getUint32(e + 128);
  let f = e + 128 + 4, o = { ColorSpace: a };
  for (let u = 0; u < t; u++) {
    let i = m(r, f, 4), c = r.getUint32(f + 4), l = r.getUint32(f + 8);
    if (i === "desc") {
      i = "ColorProfile";
      const s = m(r, e + c, 4);
      let x = [];
      if (s === "mluc") {
        const g = r.getUint32(e + c + 8);
        if (r.getUint32(e + c + 12) !== 12) return console.error("[MiNi exif]: ICC with invalid mluc");
        const h = e + c + 16;
        for (let p = 0; p < g; p++) {
          const E = r.getUint32(h + p * 12 + 4), O = r.getUint32(h + p * 12 + 8);
          x.push(m(r, e + c + O, E).replaceAll("\0", ""));
        }
        c += 28;
      } else s === "desc" && (l = r.getUint32(e + c + 8), x.push(m(r, e + c + 12, l).replaceAll("\0", "")));
      o[i] = x;
    }
    f += 12;
  }
  return o;
}
function F(n) {
  if (!(n instanceof ArrayBuffer)) return console.error("[MiNi exif]: input must be an ArrayBuffer");
  const e = n.byteLength, r = new DataView(n);
  if (r.getUint16(0) !== 65496) return console.error("[MiNi exif]: data is not JPG");
  const a = 65498;
  let t = [], f = null, o = 2;
  for (t.push({ marker: "0xFFD8", data: n.slice(0, 2) }); f != a; ) {
    let u = o;
    f = r.getUint16(u);
    const i = r.getUint16(u + 2), c = f.toString(16).toUpperCase().padStart(6, "0x");
    f != a ? t.push({ marker: c, data: n.slice(o, o + 2 + i) }) : t.push({ marker: c, data: n.slice(o, e) }), o += 2 + i;
  }
  return t;
}
function W(n) {
  const e = F(n);
  let r, a;
  const t = e.filter((o) => o.marker === "0xFFE1");
  t?.length && t.forEach((o) => {
    String.fromCharCode(...new Uint8Array(o.data.slice(4, 8))) === "Exif" ? r = o : a = o;
  });
  const f = H(n, e);
  return { exif: r?.data, icc: f?.data, xml: a?.data };
}
function H(n, e) {
  const r = "ICC_PROFILE\0";
  e || (e = F(n));
  const a = e.find((f) => f.marker === "0xFFE2");
  return a ? String.fromCharCode(...new Uint8Array(a.data.slice(4, 16))) !== r ? (console.error("[MiNi exif]: ICC_PROFILE missing"), null) : a : null;
}
function Y(n) {
  if (!n) return console.error("[MiNi exif]: please load file first");
  const r = F(n).filter((t) => t.marker !== "0xFFE1");
  return S(...r.map((t) => t.data));
}
function q(n) {
  const e = N(65505).buffer, r = N(n.byteLength + 8).buffer, a = _("Exif\0\0").buffer;
  return S(e, r, a, n);
}
function v(n, e) {
  if (!n) return console.error("[MiNi exif]: please load file first");
  if (!e) return console.error("[MiNi exif]: exif data missing");
  const a = F(n).filter((o) => o.marker !== "0xFFE1"), t = q(e);
  return S(a[0].data, t, ...a.slice(1).map((o) => o.data));
}
function J(n) {
  let e = n, r, a, t, f, o;
  function u() {
    if (e) {
      const { exif: i, icc: c, xml: l } = W(e);
      r = i, a = c, t = l;
    }
    if (r ? (f = D(r, 10), o = r.slice(10)) : (f = null, o = null), a && (f = { ...f, icc: I(a, 18) }), t) {
      const c = new TextDecoder().decode(t.slice(4));
      f = { ...f, xml: c };
    }
  }
  return u(), {
    load: (i) => {
      e = i, u();
    },
    //input file's arrayBuffer
    remove: () => (e = Y(e), u(), e),
    //returns new file's arrayBuffer
    read: () => ({ ...f, format: "JPG" }),
    //returns EXIF tags
    extract: () => o,
    image: () => e,
    replace: (i) => (e = v(e, i), u(), e),
    download: (i) => b(e, i),
    //NOTE: patch strings: will require for the new string to be <= current string length
    //input is {area: 'exif'|'tiff'|'gps', field: String, value:Number|Array, value2:Number|Array}, where value2 needed to rational numbers
    //or [{...},{...}]
    patch: (i) => {
      function c(l) {
        if (l instanceof Object) {
          const { area: s, field: x, value: g, value2: d } = l;
          if (!s || !x || g === void 0) return console.error("[MiNi exif]: patch missing input", s, x, g);
          o = P(f, o, s, x, g, d);
        } else return console.error("[MiNi exif]: patch wrong input", l);
      }
      if (!f) return console.error("[MiNi exif]: no exif data");
      i instanceof Array ? i.forEach((l) => c(l)) : i instanceof Object && c(i), e = v(e, o), u();
    }
  };
}
let A;
function K(n) {
  if (!A) {
    A = new Uint32Array(256);
    for (let t = 0; t < 256; t++) {
      let f = t;
      for (let o = 0; o < 8; o++)
        f & 1 ? f = 3988292384 ^ f >>> 1 : f = f >>> 1;
      A[t] = f;
    }
  }
  for (var e = -1, r = new Uint8Array(n), a = 0; a < n.byteLength; a++)
    e = e >>> 8 ^ A[(e ^ r[a]) & 255];
  return (e ^ -1) >>> 0;
}
function $(n, e, r) {
  const a = n.getUint32(e), t = m(n, e + 4, 4), f = e + 8, o = n.getUint32(e + 8 + a), u = r.slice(e, e + 12 + a);
  return { len: a, type: t, data: u, dataoffset: f, crc: o };
}
function M(n) {
  return n.data.slice(8, -4);
}
function Q(n, e) {
  const r = n.byteLength, a = k(n.byteLength).buffer, t = _(e).buffer;
  let f = S(a, t, n);
  const o = K(f.slice(4)), u = k(o).buffer;
  return f = S(f, u), { len: r, type: e, data: f, crc: o };
}
function U(n) {
  if (!(n instanceof ArrayBuffer)) return console.error("[MiNi exif]: input must be an ArrayBuffer");
  const e = n.byteLength, r = new DataView(n);
  if (r.getUint32(0) !== 2303741511 || r.getUint32(4) !== 218765834) return console.error("[MiNi exif]: data is not PNG");
  let a = 8, t = [{ len: 8, type: "", data: n.slice(0, 8), dataoffset: 0, crc: 0 }];
  for (; a < e; ) {
    const f = $(r, a, n);
    t.push(f), a += 12 + f.len;
  }
  return t;
}
function Z(n) {
  const e = U(n);
  let r = e.find((f) => f.type === "eXIf");
  r && (r = M(r));
  let a = ee(n, e);
  if (a) {
    let f = !0, o = 0, u = new Uint8Array(a);
    for (; f !== 0; )
      f = u[o++];
    o++, u = u.slice(o), a = fflate.decompressSync(new Uint8Array(u))?.buffer;
  }
  let t = V(n, e);
  return { exif: r, icc: a, xml: t };
}
function V(n, e) {
  e || (e = U(n));
  let r = null;
  const a = e.filter((t) => t.type === "iTXt");
  return a?.length && a.forEach((t) => {
    const f = M(t);
    String.fromCharCode(...new Uint8Array(f.slice(0, 3))) === "XML" && (r = f);
  }), r;
}
function ee(n, e) {
  e || (e = U(n));
  const r = e.find((a) => a.type === "iCCP");
  return r ? M(r) : null;
}
function te(n) {
  if (!n) return console.error("[MiNi exif]: please load file first");
  const r = U(n).filter((t) => t.type !== "eXIf" && t.type !== "iTXt");
  return S(...r.map((t) => t.data));
}
function G(n, e) {
  if (!n) return console.error("[MiNi exif]: please load file first");
  if (!e) return console.error("[MiNi exif]: exif data missing");
  const a = U(n).filter((o) => o.type !== "eXIf" && o.type !== "iTXt"), t = Q(e, "eXIf");
  return S(...a.slice(0, 2).map((o) => o.data), t.data, ...a.slice(2).map((o) => o.data));
}
function ne(n) {
  let e = n, r, a, t, f, o;
  function u() {
    if (e) {
      const { exif: i, icc: c, xml: l } = Z(e);
      r = i, a = c, t = l;
    }
    if (r ? (f = D(r, 0), o = r.slice(0)) : (f = null, o = null), a && (f = { ...f, icc: I(a, 0) }), t) {
      const c = new TextDecoder().decode(t);
      f = { ...f, xml: c };
    }
  }
  return u(), {
    load: (i) => {
      e = i, u();
    },
    //input file's arrayBuffer
    remove: () => (e = te(e), u(), e),
    //returns new file's arrayBuffer
    read: () => ({ ...f, format: "PNG" }),
    //returns EXIF tags
    extract: () => o,
    image: () => e,
    replace: (i) => (e = G(e, i), u(), e),
    download: (i) => b(e, i),
    //NOTE: patch strings: will require for the new string to be <= current string length
    //input is {area: 'exif'|'tiff'|'gps', field: String, value:Number|Array, value2:Number|Array}, where value2 needed to rational numbers
    //or [{...},{...}]
    patch: (i) => {
      function c(l) {
        if (l instanceof Object) {
          const { area: s, field: x, value: g, value2: d } = l;
          if (!s || !x || g === void 0) return console.error("[MiNi exif]: patch input missing", s, x, g);
          o = P(f, o, s, x, g, d);
        } else return console.error("[MiNi exif]: patch input wrong", l);
      }
      if (!f) return console.error("[MiNi exif]: no exif data");
      i instanceof Array ? i.forEach((l) => c(l)) : i instanceof Object && c(i), e = G(e, o), u();
    }
  };
}
function re(n, e) {
  const r = n.getUint32(e);
  return r === 0 ? {
    length: n.byteLength - e,
    contentOffset: e + 4 + 4
  } : r === 1 && n.getUint32(e + 8) === 0 ? {
    length: n.getUint32(e + 12),
    contentOffset: e + 4 + 4 + 8
  } : {
    length: r,
    contentOffset: e + 4 + 4
  };
}
function ie(n, e) {
  const { length: r, contentOffset: a } = re(n, e);
  return r < 8 ? void 0 : { type: n.getUint32(e + 4), length: r, str: m(n, e + 4, 4), contentOffset: a };
}
function L(n, e) {
  let r = {}, a = e.length - 8, t = e.contentOffset;
  for (; a > 0; ) {
    const f = m(n, t + 4, 4), o = n.getUint32(t);
    r[f] = { length: o, str: f, contentOffset: t + 8 }, t += o, a -= o;
  }
  return r;
}
function oe(n) {
  if (!(n instanceof ArrayBuffer)) return console.error("[MiNi exif]: input must be an ArrayBuffer");
  n.byteLength;
  const e = new DataView(n);
  if (e.getUint32(4) !== 1718909296 && e.getUint32(8) !== 1751476579 || e.getUint32(4) !== 1718909296 && e.getUint32(8) !== 1635150182) return console.error("[MiNi exif]: data is not HEIC/AVIF");
  let r = {};
  e.getUint32(8) === 1751476579 ? r = { _format: "HEIC" } : r = { _format: "AVIF" };
  let a = 0, t, f, o = {}, u = {};
  for (; a + 4 + 4 <= e.byteLength; ) {
    const i = ie(e, a);
    if (i === void 0) break;
    if (i.str === "meta") {
      a += 12;
      continue;
    }
    if (i.str === "iinf") {
      let c = e.getUint32(i.contentOffset + 2), l = i.contentOffset + 8 + 2;
      for (let s = 0; s < c; s++)
        if (e.getUint32(l + 12) === 1165519206 ? t = e.getUint32(l + 8) : e.getUint32(l + 12) === 1835625829 && (f = e.getUint32(l + 8)), s + 1 < c)
          for (l += 16; e.getUint32(l) !== 1768842853 && l < 2e4; )
            l++;
    } else if (i.str === "iloc") {
      e.getUint32(i.contentOffset + 2);
      const c = e.getUint16(i.contentOffset + 6), l = (i.length - 16) / c, s = i.contentOffset + 8;
      for (let x = 0; x < c; x++)
        if (l === 16) {
          const g = e.getUint32(s + x * l), d = e.getUint32(s + x * l + 8), h = e.getUint32(s + x * l + 12);
          u[g] = { id: g, off: d, size: h, type: "heic" };
        } else if (l === 18) {
          const g = e.getUint32(s + x * l);
          let d = e.getUint32(s + x * l + 4);
          d || (d = e.getUint32(s + x * l + 10));
          const h = e.getUint32(s + x * l + 14);
          u[g] = { id: g, off: d, size: h, type: "avif" };
        } else console.error("[MiNi exif]: unknown iloc block length", l);
    } else if (i.str === "iprp") {
      const c = L(e, i);
      if (c.ipco) {
        const l = L(e, c.ipco);
        if (l.colr) {
          const s = m(e, l.colr.contentOffset, 4);
          if (s === "prof" || s === "rICC") {
            const x = l.colr.contentOffset + 4;
            o = { offset: x, data: n.slice(x, x + l.colr.length - 8) };
          }
        }
      }
    }
    a += i.length;
  }
  if (t && u[t]) {
    const { off: i, size: c, type: l } = u[t];
    if (l === "heic") {
      const s = e.getUint32(i), x = n.slice(i + 4 + s, i + 4 + s + c - 4 - s);
      r.exif = { data: x, offset: i + 4 + s };
    } else if (l === "avif") {
      const s = e.getUint32(i), x = n.slice(i + 4 + s, i + 4 + s + c - 4 - s);
      r.exif = { data: x, offset: i + 4 + s };
    }
  }
  if (f && u[f]) {
    const { off: i, size: c, type: l } = u[f];
    if (l === "heic") {
      const s = n.slice(i, i + c);
      r.xml = { data: s, offset: i };
    } else if (l === "avif") {
      const s = n.slice(i, i + c);
      r.xml = { data: s, offset: i };
    }
  }
  return r.icc = o, r;
}
function B(n, e, r) {
  if (!n) return console.error("[MiNi exif]: please load file first");
  if (!e) return console.error("[MiNi exif]: exif data missing");
  const a = r.offset, t = r.data.byteLength;
  return S(n.slice(0, a), e, n.slice(a + t));
}
function se(n) {
  let e = n, r, a, t, f, o;
  function u() {
    if (e) {
      const { exif: c, icc: l, xml: s, _format: x } = oe(e);
      a = c, t = l, f = s, r = x;
    }
    i();
  }
  function i() {
    if (a?.data ? (o = D(a.data, 0), o = { ...o, format: r }) : o = null, t?.data && (o = { ...o, icc: I(t.data, 0) }), f) {
      const l = new TextDecoder().decode(f.data);
      o = { ...o, xml: l };
    }
  }
  return u(), {
    load: (c) => {
      e = c, u();
    },
    //input file's arrayBuffer
    read: () => o,
    //returns EXIF tags
    extract: () => a.data,
    image: () => e,
    download: (c) => b(e, c),
    replace: (c) => c.byteLength !== a.data.byteLength ? console.error("[MiNi exif]: new exif length must be " + a.data.byteLength + " bytes") : (e = B(e, c, a), u(), e),
    patch: (c) => {
      function l(s) {
        if (s instanceof Object) {
          const { area: x, field: g, value: d, value2: h } = s;
          if (!x || !g || d === void 0) return console.error("[MiNi exif]: patch missing input", x, g, d);
          a.data = P(o, a.data, x, g, d, h);
        } else return console.error("[MiNi exif]: patch wrong input", s);
      }
      if (!o) return console.error("[MiNi exif]: no exif data");
      c instanceof Array ? c.forEach((s) => l(s)) : c instanceof Object && l(c), e = B(e, a.data, a), u();
    }
  };
}
function ae(n, e) {
  const r = n.getUint32(e);
  return r === 0 ? {
    length: n.byteLength - e,
    contentOffset: e + 4 + 4
  } : r === 1 && n.getUint32(e + 8) === 0 ? {
    length: n.getUint32(e + 12),
    contentOffset: e + 4 + 4 + 8
  } : {
    length: r,
    contentOffset: e + 4 + 4
  };
}
function fe(n, e) {
  const { length: r, contentOffset: a } = ae(n, e);
  return r < 8 ? void 0 : { type: n.getUint32(e + 4), length: r, str: m(n, e + 4, 4), contentOffset: a };
}
function T(n, e) {
  let r = {}, a = e.length - 8, t = e.contentOffset;
  for (; a > 0; ) {
    const f = m(n, t + 4, 4), o = n.getUint32(t);
    r[f] = { length: o, str: f, contentOffset: t + 8 }, t += o, a -= o;
  }
  return r;
}
function ce(n) {
  if (!(n instanceof ArrayBuffer)) return console.error("[MiNi exif]: input must be an ArrayBuffer");
  n.byteLength;
  const e = new DataView(n);
  if (!(e.getUint32(4) === 1718909296 && e.getUint32(8) === 1903435808))
    return console.error("[MiNi exif]: data is not QuickTime");
  let r = 0, a = [], t = [];
  for (; r + 4 + 4 <= e.byteLength; ) {
    const o = fe(e, r);
    if (o === void 0) break;
    if (o.str === "meta") {
      r += 12;
      continue;
    }
    if (o.str === "moov") {
      const u = T(e, o);
      if (u.meta) {
        const i = T(e, u.meta);
        let c;
        if (i.keys) {
          let l = i.keys.contentOffset;
          i.length, c = e.getUint32(l + 4), l = l + 8;
          for (let s = 0; s < c; s++) {
            const x = e.getUint32(l);
            if (e.getUint32(l + 4) !== 1835299937) continue;
            const d = m(e, l + 8, x - 8);
            a.push(d), l += x;
          }
          a = a.map((s) => s.replace("com.apple.quicktime.", ""));
        }
        if (i.ilst) {
          let l = i.ilst.contentOffset;
          for (let s = 0; s < c; s++) {
            const x = e.getUint32(l), g = e.getUint32(l + 8);
            if (e.getUint32(l + 12) !== 1684108385) continue;
            const h = m(e, l + 16 + 8, g - 8 - 8);
            t.push({ value: h, offset: l + 16 + 8, type: 2 }), l += x;
          }
        }
      }
    }
    r += o.length;
  }
  let f = {};
  if (a.length && t.length) {
    let o = a.reduce((u, i, c) => (u[i] = t[c], u), {});
    if (f.meta = o, f.meta["location.ISO6709"]) {
      const u = f.meta["location.ISO6709"].value;
      f.gps = { GPSLatitude: { value: parseFloat(u) }, GPSLongitude: { value: parseFloat(u.slice(8)) }, GPSAltitude: { value: parseFloat(u.slice(17)) } };
    }
  }
  return f;
}
function ue(n, e = !1) {
  if (!(n instanceof ArrayBuffer)) return console.error("[MiNi exif]: input must be an ArrayBuffer");
  const r = new DataView(n);
  if (r.getUint16(0) === 65496)
    return J(n);
  if (r.getUint32(0) === 2303741511 && r.getUint32(4) === 218765834)
    return ne(n);
  if (r.getUint32(4) === 1718909296 && (r.getUint32(8) === 1751476579 || r.getUint32(8) === 1635150182))
    return se(n);
  if (e || r.getUint32(4) === 1718909296 && r.getUint32(8) === 1903435808)
    return ce(n);
  console.error("[MiNi exif]: unknown format");
}
export {
  ue as default
};
