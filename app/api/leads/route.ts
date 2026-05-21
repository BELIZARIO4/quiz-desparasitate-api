import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Variáveis de ambiente do Supabase não configuradas." },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Nome, email e telefone são obrigatórios." },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data, error } = await supabase
      .from("quiz_leads")
      .insert({
        name,
        email,
        phone,
        utms: body.utms || {},
        answers: body.answers || {},
        possible_agent: body.possibleAgent || null,
        page: body.page || null,
        referrer: body.referrer || null,
        user_agent: body.userAgent || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro Supabase:", error);

      return NextResponse.json(
        { error: "Erro ao salvar lead no Supabase." },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: data.id,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Erro geral:", error);

    return NextResponse.json(
      { error: "Erro inesperado ao processar lead." },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}
