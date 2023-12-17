---
title: "BPE beyond Word Boundary: How NOT to use MWEs in NMT"
post_slug: mwe-bpe
post_image: "mwe-bpe-tokenization-examples.png"
layout: project
tags: ["Python", "NLP", "Multi-Word Expressions", "Byte-Pair Encoding", "PyTorch", "Transformers"]
description: "A research project to identify Multi-Word Expressions using Byte Pair Encoding."
sourcecode: "https://github.com/pegasus-lynx/mwe-bpe"
---


> Tokenization is the process of breaking a stream of textual data into characters, subwords, words, terms, sentences, symbols, or some other meaningful elements called tokens.

Tokenization is the first step in any NLP task and has an important effect on rest of our pipeline for the task. A tokenizer breaks raw text into tokens, which can be used directly as a vector representing that document.

In this project, we experiment with Byte-Pair Encoding ( BPE ) - a subword-based tokenization scheme. BPE was originally developed for data compression and later adapted for tokenization in NLP. The core idea behind BPE is to  iteratively merge the most frequent pairs of bytes (or characters in the context of NLP) into a single, new byte (or token).

With this basic set of information, let's get into what this project is all about.

### Motivation

BPE tokenization merges characters into longer tokens by finding frequently occurring contiguous patterns, such as _-ing_ or _-ly_ within the word boundary. This project stretches the motivation further by allowing BPE to cross word boundaries. 

> Multiword Expressions ( MWEs ) are expressions which are made up of at least 2 words and which can be syntactically and/or semantically idiosyncratic in nature. Moreover, they act as a single unit at some level of linguistic analysis.

N-gram tokens have been used in traditional NLP for a long time and with much success. For example, "New York", a _bigram_ ( a token consisting of 2 words ) can be a concise yet useful feature in a Named Entity Recognition task. Similarly, a Spanish-Neglish Machine Translation ( MT ) model might benefit from having the bigram _te amo_ or its trigram translation _I love you_ in its vocabulary. Finally, a model’s vocabulary could even extend to non-contiguous tokens or __*k-skip-n-grams*__ such as *neither · nor*. This token reappears in several contexts e.g. *neither <u>tea</u> nor <u>coffee</u>* and *neither <u>here</u> nor <u>there</u>* ( underlined words replace the · skip).

### Extending BPE

In this project, we experimented with two kinds of ways to add MWEs to a BPE vocabulary.

1. **BPE beyond words** : In this approach, we used **BPE+ngms** ( ngms - N-grams ) i.e. allowing BPE to choose between not just adding subwords but also frequently occurring n-grams. For this prject, we limited to use bigrams and trigrams. Besides continuous MWEs we also experimented with discontinuous MWEs, i.e., *k-skip-n-grams*, which we refer to concisely as skipgrams. In particularly, we focus on 1-skip-3-grams e.g., *neither · nor*, *I · you* .
   
2. **Adding MWEs with PMI** : However, the above approach does not work well in practice. Therefore, instead of raw frequency, here we find MWEs using a common technique of finding word collocations: Pointwise Mutual Information (PMI), which is a measure of the association between two word types in text. We used similar MWEs ( bigram, trigrams, combination of bigram and trigrams, and skipgrams )

![MWE BPE Coverage and Examples](/assets/images/mwe-bpe-coverage-examples.png)

In the interest of keeping this article concise, I will not dive deep into all the parameters used for finding MWEs, the dataset and experiment configurations used for Neural Machine Translation (NMT) experiments. 

### Results and Discussions

Empirically we observe that BPE with high frequency MWE tokens see a drop in performance whereas the PMI counterpart as well as the original baseline (within word boundary) performs well. What then happens at the word boundary that the BPE algorithm stops working? *We hypothesize that this is the result of words combining in more diverse ways than subwords.*

![MWE BPE Experiment Results](/assets/images/mwe-bpe-score-table.png)

High frequency MWE tokens include n-grams like *in_the, that_in, of_the*, etc. However, as seen in the table adding these tokens hurts the performance. Words like *in*, *the*, *of*, etc. make many versatile combinations, which is rarely observed at the subword level. Suffixes like *-ing* almost never appear as prefixes whereas prefixes like de almost never appear as suffixes. When such subwords combine to form longer tokens, they generally retain a coherent meaning, unlike n-grams like *in_the*. 

Finally, this hypothesis may explain why MWEs ordered by PMI help improve MT scores – they are by definition units that co-occur as a coherent unit. Indeed, the MWEs thus found (e.g. *New_York, per_cent*) include constituents which exclusively form only these tokens.

I would really like to thank Avijit Thawani, who brought up this idea and project to life and was the major driving force behind these experiments.
