interface EmailProps {
  to: string;
  from: string;
  title: string;
  html:string|undefined
}

export default class Email {
  private to: string;
  private from: string;
  private subject: string;
  private html:string

  constructor(props: EmailProps) {
    this.to = props.to;
    this.from = props.from;
    this.subject = props.title;
    this.html = props.html||""


    if (this.to.length === 0 || !this.to.includes("@")) {
      throw new Error(`Email "to" không hợp lệ: "${this.to}"`);
    }

    if (this.from.length === 0 || !this.from.includes("@")) {
      throw new Error(`Email "from" không hợp lệ: "${this.from}"`);
    }

    if (this.subject.length === 0) {
      throw new Error(`Tiêu đề email không được để trống`);
    }
  }

  get info() {
    return {
      to: this.to,
      from: this.from,
      subject: this.subject,
      html:this.html
    };
  }
}