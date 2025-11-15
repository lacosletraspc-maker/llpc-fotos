
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  var fotoEl = $("tema-foto");
  var fotoLoadingEl = $("tema-foto-loading");
  var nomeEl = $("tema-nome");
  var totalEl = $("tema-total");
  var d1El = $("tema-desc1");
  var d2El = $("tema-desc2");
  var ctaEl = $("tema-cta-whats");
  var produtosBox = $("produtos-tema");

  function formatMoney(v) {
    if (v == null || v === "") return "";
    if (typeof v === "number") {
      try {
        return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      } catch (e) {
        return "R$ " + v.toFixed(2).replace(".", ",");
      }
    }
    var num = parseFloat(
      String(v)
        .replace(/\./g, "")
        .replace(",", ".")
    );
    if (!isNaN(num)) {
      try {
        return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      } catch (e2) {
        return "R$ " + num.toFixed(2).replace(".", ",");
      }
    }
    return String(v);
  }

  function asArray(obj, key) {
    if (Array.isArray(obj)) return obj;
    if (obj && key && Array.isArray(obj[key])) return obj[key];
    return [];
  }

  function fetchJson(url) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .catch(function () {
        return null;
      });
  }

  function showError(msg) {
    if (nomeEl) nomeEl.textContent = msg;
    if (fotoLoadingEl) fotoLoadingEl.textContent = msg;
    if (produtosBox) {
      produtosBox.innerHTML =
        '<p class="col-span-full text-center text-gray-500 text-sm">' +
        msg +
        "</p>";
    }
  }

  var params = new URLSearchParams(window.location.search);
  var slug = (params.get("slug") || "").toLowerCase();

  if (!slug) {
    showError("Tema não encontrado.");
    return;
  }

  Promise.all([
    fetchJson("catalogo/index.json"),
    fetchJson("catalogo/cards.json"),
    fetchJson("precos.json"),
  ]).then(function (results) {
    var temas = asArray(results[0], "temas");
    var cardsData = asArray(results[1], "cards");
    var precos = asArray(results[2], "precos");

    var tema =
      (temas || []).find(function (t) {
        var s = (t.slug || "").toString().toLowerCase();
        return s === slug;
      }) || null;

    var nomeTema =
      (tema && (tema.tema || tema.nome)) || "Tema personalizado";
    var nomeKey = nomeTema.toLowerCase();

    // HERO
    if (tema) {
      var hero =
        tema.hero || tema.thumb || tema.capa || "";
      if (hero && fotoEl && fotoLoadingEl) {
        fotoEl.src = hero;
        fotoEl.alt = nomeTema;
        fotoEl.classList.remove("hidden");
        fotoLoadingEl.classList.add("hidden");
      }
      if (totalEl && tema.total != null) {
        totalEl.textContent = tema.total + " fotos no catálogo.";
      }
    } else {
      if (nomeEl) nomeEl.textContent = nomeTema;
    }

    // Descrições básicas (caso especial para Bela e a Fera / Hot Wheels)
    var nomeLower = nomeTema.toLowerCase();
    var desc1 = "";
    var desc2 = "";

    if (nomeLower.indexOf("bela") !== -1 && nomeLower.indexOf("fera") !== -1) {
      desc1 =
        "Rosas encantadas, livros, castelo e muito dourado ✨: a versão LLPC de A Bela e a Fera foi pensada para criar uma mesa elegante e acolhedora, do topo de bolo às caixinhas de lembrancinha.";
      desc2 =
        "Nas quatro linhas (Essencial, Clássica, Premium e Luxo) você escolhe se prefere algo mais delicado e econômico ou um visual de castelo real, com muitas camadas, brilho e detalhes em 3D — sempre com opções que cabem no seu bolso.";
    } else if (
      nomeLower.indexOf("hot") !== -1 &&
      nomeLower.indexOf("wheel") !== -1
    ) {
      desc1 =
        "Pistas, chamas e carrinhos em alta velocidade 🏎️: o tema Hot Wheels da LLPC destaca cores vibrantes e elementos em 3D para deixar a mesa com cara de corrida.";
      desc2 =
        "Você decide o nível de impacto: das versões Essencial e Clássica, mais econômicas, às versões Premium e Luxo, com mais camadas, brilho e sensação de movimento — sem perder o controle do orçamento.";
    } else {
      desc1 =
        "Imagine a mesa da sua festa montada com esse tema, cheia de detalhes em papel que deixam tudo mais acolhedor e fotogênico.";
      desc2 =
        "Você escolhe a linha (Essencial, Clássica, Premium ou Luxo) e nós adaptamos o kit ao seu orçamento, sem perder o encanto.";
    }

    if (nomeEl) nomeEl.textContent = nomeTema;
    if (d1El) d1El.textContent = desc1;
    if (d2El) d2El.textContent = desc2;

    // CTA WhatsApp geral do tema
    if (ctaEl) {
      var msgTema =
        "Quero montar um kit no tema " +
        nomeTema +
        " com a Lale da Laços & Letras Papelaria Criativa.";
      ctaEl.href =
        "https://wa.me/?text=" + encodeURIComponent(msgTema);
    }

    // Mapa Card -> primeira foto (cards.json)
    var cardFotosMap = {};
    (cardsData || []).forEach(function (c) {
      var s = (c.tema_slug || "").toString().toLowerCase();
      var n = (c.tema || "").toString().toLowerCase();
      if (s && s !== slug && n !== nomeKey) return;

      var cardKey = (c.card || "").toString().trim().toLowerCase();
      if (!cardKey) return;

      if (!cardFotosMap[cardKey]) cardFotosMap[cardKey] = [];

      if (Array.isArray(c.fotos)) {
        c.fotos.forEach(function (u) {
          if (u && cardFotosMap[cardKey].indexOf(u) === -1) {
            cardFotosMap[cardKey].push(u);
          }
        });
      } else if (c.url_jsdelivr) {
        var u2 = String(c.url_jsdelivr);
        if (u2 && cardFotosMap[cardKey].indexOf(u2) === -1) {
          cardFotosMap[cardKey].push(u2);
        }
      }
    });

    // Produtos / preços (precos.json)
    if (!Array.isArray(precos) || !precos.length) {
      showError(
        "Ainda não temos uma tabela de preços publicada para este tema. Fale com a Lale para montar um orçamento que caiba no seu bolso."
      );
      return;
    }

    var produtosTema = precos.filter(function (p) {
      var t = (p.tema || "").toString().toLowerCase();
      if (t && nomeKey && t === nomeKey) return true;
      if (t && nomeKey && t.indexOf(nomeKey) !== -1) return true;

      // fallback por slug, caso o campo tema seja diferente
      if (t && slug && t.indexOf(slug.replace(/-/g, " ")) !== -1) return true;
      return false;
    });

    if (!produtosTema.length) {
      showError(
        "Ainda não temos preços separados para este tema. Fale com a Lale para receber um orçamento personalizado."
      );
      return;
    }

    var grupos = {};
    produtosTema.forEach(function (p) {
      var col = p.colecao || "Linha única";
      if (!grupos[col]) grupos[col] = [];
      grupos[col].push(p);
    });

    var html = "";
    Object.keys(grupos)
      .sort()
      .forEach(function (colecao) {
        var lista = grupos[colecao];

        html +=
          '<article class="col-span-full border rounded-lg bg-white p-4 mb-2">';
        html +=
          '<div class="flex items-center justify-between mb-2 gap-2">';
        html +=
          '<h3 class="font-semibold text-emerald-700 text-sm md:text-base">Linha ' +
          colecao +
          "</h3>";
        html +=
          '<span class="text-[11px] md:text-xs text-gray-500 text-right">Valores de referência — podem variar conforme quantidade e personalização.</span>';
        html += "</div>";
        html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">';

        lista.forEach(function (p) {
          var titulo = p.card || p.produto || "Produto";
          var tipo = p.tipo || "";
          var precoDe =
            p.preco_de != null
              ? p.preco_de
              : p.precoDe != null
              ? p.precoDe
              : null;
          var precoPor =
            p.preco != null
              ? p.preco
              : p.preco_por != null
              ? p.preco_por
              : p.preco_whats != null
              ? p.preco_whats
              : null;

          var temDesc =
            precoDe != null &&
            precoPor != null &&
            String(precoDe) !== String(precoPor);

          var cardKey = (p.card || "").toString().trim().toLowerCase();
          var fotos = cardKey && cardFotosMap[cardKey]
            ? cardFotosMap[cardKey]
            : [];
          var capa = fotos.length ? fotos[0] : "";

          var msgItem =
            'Quero um orçamento do item "' +
            titulo +
            '" no tema ' +
            nomeTema +
            " (Linha " +
            colecao +
            ") com a Lale da Laços & Letras Papelaria Criativa.";
          var waItem =
            "https://wa.me/?text=" + encodeURIComponent(msgItem);

          html +=
            '<div class="border rounded-md p-3 flex flex-col gap-2 text-sm bg-white hover:shadow-sm transition-shadow">';

          if (capa) {
            html +=
              '<div class="mb-2"><img src="' +
              capa +
              '" alt="' +
              titulo.replace(/"/g, "&quot;") +
              " - " +
              nomeTema.replace(/"/g, "&quot;") +
              '" class="w-full h-32 object-cover rounded bg-gray-100"></div>';
          }

          html += "<div>";
          html +=
            '<p class="font-semibold text-gray-800">' +
            titulo +
            "</p>";
          if (tipo) {
            html +=
              '<p class="text-xs text-gray-500">' +
              tipo +
              "</p>";
          }
          html += "</div>";

          html += '<div class="mt-1">';
          if (temDesc) {
            html +=
              '<p class="text-xs text-gray-500 line-through">de ' +
              formatMoney(precoDe) +
              "</p>";
            html +=
              '<p class="text-base font-semibold text-emerald-700">por ' +
              formatMoney(precoPor) +
              "</p>";
          } else if (precoPor != null || precoDe != null) {
            var base = precoPor != null ? precoPor : precoDe;
            html +=
              '<p class="text-base font-semibold text-emerald-700">' +
              formatMoney(base) +
              "</p>";
          } else {
            html +=
              '<p class="text-sm text-gray-600">Preço sob consulta.</p>';
          }
          html += "</div>";

          html +=
            '<p class="text-[11px] text-gray-500">Valores para referência. Confirme quantidade, distância e personalizações com a Lale.</p>';
          html +=
            '<a href="' +
            waItem +
            '" target="_blank" rel="noopener" class="mt-1 inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">📲 Pedir este item pelo WhatsApp</a>';

          html += "</div>";
        });

        html += "</div></article>";
      });

    produtosBox.innerHTML = html;
  });
})();