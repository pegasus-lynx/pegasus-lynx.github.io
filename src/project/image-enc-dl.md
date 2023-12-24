---
title: "Image Encryption Algorithms for privacy in Deep Learning"
post_slug: image-enc-dl
post_image: "imgencdl-cover.png"
layout: project
tags: ["Python", "Deep Learning", "Image Processing"]
description: "An exploratory project on different learnable image encryption schemes for privacy in deep learning."
sourcecode: "https://github.com/pegasus-lynx/imgEncDL/tree/main"
startdate: "01-03-2021"
enddate: "01-04-2021"
---

In this project, we delved into the realm of enhancing privacy in Deep Neural Networks ( DNNs ) through learnable image encryption algorithms. 

> **Learnable Image Encryption Algorithms**, refer to those algorithms that, where the encrypted images obtained after encryption can be applied to a learning algorithm such as DNNs as training and testing data.

### Why is this important ?

Distributed systems like cloud and edge computing in various fields, which, while beneficial, pose risks like unauthorized service use, data leaks, and privacy breaches due to unreliable providers and accidents. The spread of Deep Neural Networks (DNNs) has been transformative in areas such as computer vision, biomedical systems, and information technology, leveraging large datasets, including sensitive information, to enhance performance. However, this integration of machine learning in distributed systems introduces security concerns like compromised data privacy and unauthorized access, making privacy-preserving machine learning an urgent priority, especially as DNNs are deployed in critical areas like autonomous vehicles, healthcare, and finance, where they must be robust against various attacks such as model inversion attacks, membership inference attacks, and adversarial attacks.

### What I did and learn ?

As mentioned earlier, the main aim here was to learn and understand what learnable image encryption algorithms we have, how they work and test their robustness.

First, I implemented the encryption schemes, particularly focusing on the SKK, Tanaka and ETC schemes ( Encryption-then-Compression schemes ), and encrypted image datasets to reproduce and verified the results of training for Tanaka scheme. The picture below shows the result of SKK encryption on an image.

![SKK Encryption Result](/assets/images/imgencdl-skk-encryption.png)

Second, I also looked into different attack scenarios for Tanaka and different variations of SKK schemes. Implemented the attack scenarios mentioned in [Attacks on Image Encryption Schemes for
Privacy-Preserving Deep Neural Networks](https://arxiv.org/pdf/2004.13263.pdf) for these encryption schemes, to test the robustness of these methods and replicated the results mentioned in the paper. The image below, shows the results of various attacks on SKK scheme encrypted image.

![SKK Encryption Scheme Attacks](/assets/images/imgencdl-skk-attack.png)

#### References

Here is the list of research papers that I referenced while doing this exploratory project : 

- [An Overview of Compressible and Learnable Image Transformation with Secret Key and Its Applications](https://arxiv.org/abs/2201.11006)
- [Learnable Image Encryption](https://arxiv.org/ftp/arxiv/papers/1804/1804.00490.pdf)
- [Privacy-Preserving Deep Neural Networks with Pixel-based Image Encryption Considering Data Augmentation in the Encrypted Domain](https://arxiv.org/abs/1905.01827)
- [Attacks on Image Encryption Schemes for
Privacy-Preserving Deep Neural Networks](https://arxiv.org/pdf/2004.13263.pdf) 